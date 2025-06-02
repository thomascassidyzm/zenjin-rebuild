#!/usr/bin/env node
/**
 * XML APML to YAML APML Converter
 * Converts old XML-format APML files to new YAML-format APML v2.2
 */

import fs from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure paths
const XML_APML_DIR = path.join(__dirname, '..', 'docs', 'build', 'apml', 'interfaces');
const YAML_APML_DIR = path.join(__dirname, '..', 'docs', 'build', 'apml', 'interfaces-yaml');

// Ensure output directory exists
if (!fs.existsSync(YAML_APML_DIR)) {
  fs.mkdirSync(YAML_APML_DIR, { recursive: true });
}

/**
 * Convert XML type to YAML type
 */
function convertType(xmlType) {
  const typeMap = {
    'string': 'string',
    'number': 'number',
    'integer': 'integer',
    'boolean': 'boolean',
    'object': 'object',
    'array': 'array',
    'any': 'any'
  };
  
  // Handle array types like 'BoundaryLevel[]'
  if (xmlType.endsWith('[]')) {
    return 'array';
  }
  
  return typeMap[xmlType] || xmlType;
}

/**
 * Convert a field definition from XML to YAML format
 */
function convertField(field, indent = '      ') {
  let yaml = `${indent}${field.name}:\n`;
  yaml += `${indent}  type: "${convertType(field.type)}"\n`;
  
  if (field.required === 'true') {
    yaml += `${indent}  required: true\n`;
  } else if (field.required === 'false') {
    yaml += `${indent}  required: false\n`;
  }
  
  if (field.description) {
    yaml += `${indent}  description: "${field.description}"\n`;
  }
  
  if (field.defaultValue) {
    yaml += `${indent}  default: ${field.defaultValue}\n`;
  }
  
  // Handle array types
  if (field.type.endsWith('[]')) {
    const itemType = field.type.slice(0, -2);
    yaml += `${indent}  items:\n`;
    yaml += `${indent}    type: "${itemType}"\n`;
  }
  
  return yaml;
}

/**
 * Convert error codes to proper APML format
 */
function generateErrorCode(interfaceName, index) {
  // Extract prefix from interface name
  const prefix = interfaceName.replace('Interface', '')
    .replace(/([A-Z])/g, '$1')
    .trim()
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  return `${prefix}_${String(index + 1).padStart(3, '0')}`;
}

/**
 * Convert XML APML to YAML APML
 */
async function convertXmlToYaml(xmlFile) {
  try {
    // Read and parse XML
    const xmlContent = await fs.promises.readFile(xmlFile, 'utf8');
    const parsed = await parseStringPromise(xmlContent, {
      explicitArray: false,
      mergeAttrs: true,
      normalizeTags: false
    });
    
    const interfaceData = parsed.Interface;
    const interfaceName = interfaceData.name;
    
    // Start building YAML
    let yaml = `# ${interfaceName}.apml\n`;
    yaml += `# APML v2.2 Interface Definition\n`;
    yaml += `# Module: ${interfaceData.module}\n`;
    yaml += `# Converted from XML APML format\n\n`;
    
    // Interface metadata
    yaml += `interface_metadata:\n`;
    yaml += `  name: "${interfaceName}"\n`;
    yaml += `  version: "${interfaceData.version || '1.0.0'}"\n`;
    yaml += `  module: "${interfaceData.module}"\n`;
    
    // Add dependencies if any
    if (interfaceData.Dependencies) {
      yaml += `  dependencies:\n`;
      const deps = Array.isArray(interfaceData.Dependencies.Dependency) 
        ? interfaceData.Dependencies.Dependency 
        : [interfaceData.Dependencies.Dependency];
      deps.forEach(dep => {
        yaml += `    - "${dep}"\n`;
      });
    }
    
    // Add purpose/description
    if (interfaceData.Purpose) {
      yaml += `  description: |\n`;
      const purposeLines = interfaceData.Purpose.trim().split('\n');
      purposeLines.forEach(line => {
        yaml += `    ${line.trim()}\n`;
      });
    }
    
    // Convert data structures to types
    if (interfaceData.DataStructures && interfaceData.DataStructures.Structure) {
      yaml += `\ntypes:\n`;
      const structures = Array.isArray(interfaceData.DataStructures.Structure) 
        ? interfaceData.DataStructures.Structure 
        : [interfaceData.DataStructures.Structure];
      
      structures.forEach(struct => {
        yaml += `  ${struct.name}:\n`;
        yaml += `    description: "${struct.description || struct.name}"\n`;
        yaml += `    properties:\n`;
        
        const fields = Array.isArray(struct.Field) ? struct.Field : [struct.Field];
        fields.forEach(field => {
          yaml += convertField(field);
        });
      });
    }
    
    // Collect unique errors
    const allErrors = new Map();
    if (interfaceData.Methods && interfaceData.Methods.Method) {
      const methods = Array.isArray(interfaceData.Methods.Method) 
        ? interfaceData.Methods.Method 
        : [interfaceData.Methods.Method];
      
      methods.forEach(method => {
        if (method.Errors && method.Errors.Error) {
          const errors = Array.isArray(method.Errors.Error) 
            ? method.Errors.Error 
            : [method.Errors.Error];
          errors.forEach(error => {
            if (error.code && !allErrors.has(error.code)) {
              allErrors.set(error.code, error.description);
            }
          });
        }
      });
    }
    
    // Convert errors
    if (allErrors.size > 0) {
      yaml += `\nerrors:\n`;
      let errorIndex = 0;
      allErrors.forEach((description, code) => {
        yaml += `  ${code}:\n`;
        yaml += `    code: "${generateErrorCode(interfaceName, errorIndex)}"\n`;
        yaml += `    message: "${description}"\n`;
        errorIndex++;
      });
    }
    
    // Convert methods
    if (interfaceData.Methods && interfaceData.Methods.Method) {
      yaml += `\ninterface:\n`;
      yaml += `  ${interfaceName}:\n`;
      yaml += `    methods:\n`;
      
      const methods = Array.isArray(interfaceData.Methods.Method) 
        ? interfaceData.Methods.Method 
        : [interfaceData.Methods.Method];
      
      methods.forEach(method => {
        yaml += `      ${method.name}:\n`;
        yaml += `        description: "${method.Description}"\n`;
        
        // Parameters
        if (method.Input) {
          yaml += `        parameters:\n`;
          const inputs = Array.isArray(method.Input) ? method.Input : [method.Input];
          inputs.forEach(input => {
            yaml += `          ${input.name}:\n`;
            yaml += `            type: "${convertType(input.type)}"\n`;
            yaml += `            required: ${input.required === 'true' ? 'true' : 'false'}\n`;
            if (input.description) {
              yaml += `            description: "${input.description}"\n`;
            }
            if (input.defaultValue) {
              yaml += `            default: ${input.defaultValue}\n`;
            }
          });
        }
        
        // Returns
        if (method.Output) {
          yaml += `        returns:\n`;
          yaml += `          type: "${convertType(method.Output.type)}"\n`;
          if (method.Output.description) {
            yaml += `          description: "${method.Output.description}"\n`;
          }
          
          // Handle complex output types
          if (method.Output.Field) {
            yaml += `          properties:\n`;
            const fields = Array.isArray(method.Output.Field) 
              ? method.Output.Field 
              : [method.Output.Field];
            fields.forEach(field => {
              yaml += convertField(field, '            ');
            });
          }
        }
        
        // Errors
        if (method.Errors && method.Errors.Error) {
          yaml += `        errors:\n`;
          const errors = Array.isArray(method.Errors.Error) 
            ? method.Errors.Error 
            : [method.Errors.Error];
          errors.forEach(error => {
            if (error.code) {
              yaml += `          - "${error.code}"\n`;
            }
          });
        }
        
        // Async
        if (method.Async === 'true') {
          yaml += `        async: true\n`;
        }
      });
    }
    
    return yaml;
  } catch (error) {
    console.error(`Error converting ${xmlFile}: ${error.message}`);
    throw error;
  }
}

/**
 * Main conversion process
 */
async function main() {
  try {
    console.log('XML to YAML APML Converter');
    console.log('==========================');
    console.log(`Source: ${XML_APML_DIR}`);
    console.log(`Output: ${YAML_APML_DIR}\n`);
    
    // Find all XML APML files
    const files = await fs.promises.readdir(XML_APML_DIR);
    const xmlFiles = files.filter(file => 
      file.endsWith('.apml') && 
      !file.includes('.yaml')
    );
    
    console.log(`Found ${xmlFiles.length} XML APML files to convert.\n`);
    
    // Convert each file
    for (const file of xmlFiles) {
      const xmlPath = path.join(XML_APML_DIR, file);
      
      // Skip if it's one of our new YAML files
      if (file.includes('Cache') || file.includes('FactRepository') || file.includes('FactIdRegistry')) {
        console.log(`Skipping ${file} (already in YAML format)`);
        continue;
      }
      
      console.log(`Converting ${file}...`);
      
      try {
        const yamlContent = await convertXmlToYaml(xmlPath);
        const yamlPath = path.join(YAML_APML_DIR, file);
        await fs.promises.writeFile(yamlPath, yamlContent);
        console.log(`✓ Converted to ${path.basename(yamlPath)}`);
      } catch (error) {
        console.error(`✗ Failed: ${error.message}`);
      }
    }
    
    console.log('\nConversion complete!');
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the converter
main();