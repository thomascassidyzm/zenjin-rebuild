#!/usr/bin/env node
/**
 * APML to TypeScript Interface Converter
 * 
 * This script reads APML interface definitions and generates corresponding TypeScript interfaces.
 * It helps maintain consistency between the APML framework specifications and TypeScript implementations.
 * 
 * Usage:
 *   node apml-to-ts.js
 */

import fs from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';
import { fileURLToPath } from 'url';
import * as mkdirp from 'mkdirp';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Promisify fs functions
const readdir = fs.promises.readdir;
const readFile = fs.promises.readFile;
const writeFile = fs.promises.writeFile;
const stat = fs.promises.stat;

// Configure paths
const APML_INTERFACES_DIR = path.join(__dirname, '..', 'docs', 'build', 'apml', 'interfaces');
const TS_INTERFACES_OUTPUT_DIR = path.join(__dirname, '..', 'src', 'interfaces');

/**
 * Find all APML interface files in a directory
 * @param {string} directory - Directory to search
 * @returns {Promise<string[]>} Array of file paths
 */
async function findApmlInterfaceFiles(directory) {
  try {
    const files = await readdir(directory);
    const apmlFiles = files.filter(file => 
      file.endsWith('.apml') && 
      file.includes('Interface') && 
      !file.startsWith('.')
    );
    
    return apmlFiles.map(file => path.join(directory, file));
  } catch (error) {
    console.error(`Error finding APML interface files: ${error.message}`);
    throw error;
  }
}

/**
 * Parse APML XML file
 * @param {string} filePath - Path to APML file
 * @returns {Promise<Object>} Parsed XML data
 */
async function parseApmlFile(filePath) {
  try {
    // Read file content
    let fileContent = await readFile(filePath, 'utf8');
    
    // Fix common XML errors
    // Fix </o> tags which should be </Output>
    fileContent = fileContent.replace(/<\/o>/g, '</Output>');
    
    // Parse XML
    const result = await parseStringPromise(fileContent, {
      explicitArray: false,
      mergeAttrs: true,
      normalizeTags: false,
      explicitRoot: true
    });
    
    return result;
  } catch (error) {
    console.error(`Error parsing APML file ${filePath}: ${error.message}`);
    throw error;
  }
}

/**
 * Convert APML field type to TypeScript type
 * @param {string} apmlType - APML type
 * @returns {string} TypeScript type
 */
function convertType(apmlType) {
  // Map APML types to TypeScript types
  const typeMap = {
    'string': 'string',
    'number': 'number',
    'boolean': 'boolean',
    'object': 'Record<string, any>',
    'array': 'any[]',
    'any': 'any'
  };
  
  return typeMap[apmlType] || apmlType;
}

/**
 * Generate TypeScript interface from APML data structure
 * @param {Object} structure - APML structure data
 * @returns {string} TypeScript interface definition
 */
function generateInterface(structure) {
  let tsInterface = `/**\n * ${structure.name}\n */\n`;
  tsInterface += `export interface ${structure.name} {\n`;
  
  // Handle fields if they exist
  if (structure.Field) {
    // Convert to array if it's a single field
    const fields = Array.isArray(structure.Field) ? structure.Field : [structure.Field];
    
    fields.forEach(field => {
      const required = field.required === 'true' ? '' : '?';
      const tsType = convertType(field.type);
      const description = field.description ? ` // ${field.description}` : '';
      
      tsInterface += `  ${field.name}${required}: ${tsType};${description}\n`;
    });
  }
  
  tsInterface += '}\n\n';
  return tsInterface;
}

/**
 * Generate TypeScript enum from APML errors
 * @param {Object} errors - APML errors data
 * @param {string} interfaceName - Name of the interface
 * @returns {string} TypeScript enum definition
 */
function generateErrorEnum(errors, interfaceName) {
  if (!errors || !errors.Error) return '';
  
  const enumName = `${interfaceName.replace('Interface', '')}ErrorCode`;
  let tsEnum = `/**\n * Error codes for ${interfaceName}\n */\n`;
  tsEnum += `export enum ${enumName} {\n`;
  
  // Convert to array if it's a single error
  const errorItems = Array.isArray(errors.Error) ? errors.Error : [errors.Error];
  
  errorItems.forEach(error => {
    tsEnum += `  ${error.code} = '${error.code}',\n`;
  });
  
  tsEnum += '}\n\n';
  return tsEnum;
}

/**
 * Generate TypeScript method signature
 * @param {Object} method - APML method data
 * @returns {string} TypeScript method signature
 */
function generateMethodSignature(method) {
  let methodSignature = `  /**\n   * ${method.Description}\n`;
  
  // Add JSDoc for inputs
  if (method.Input) {
    const inputs = Array.isArray(method.Input) ? method.Input : [method.Input];
    inputs.forEach(input => {
      methodSignature += `   * @param ${input.name} - ${input.description}\n`;
    });
  }
  
  // Add JSDoc for output
  if (method.Output) {
    const outputDesc = method.Output.description || 'Result of the operation';
    methodSignature += `   * @returns ${outputDesc}\n`;
  }
  
  // Add JSDoc for errors
  if (method.Errors && method.Errors.Error) {
    const errors = Array.isArray(method.Errors.Error) ? method.Errors.Error : [method.Errors.Error];
    errors.forEach(error => {
      methodSignature += `   * @throws ${error.code} if ${error.description}\n`;
    });
  }
  
  methodSignature += `   */\n`;
  
  // Method signature
  methodSignature += `  ${method.name}(`;
  
  // Method parameters
  if (method.Input) {
    const inputs = Array.isArray(method.Input) ? method.Input : [method.Input];
    const params = inputs.map(input => {
      const required = input.required === 'true' ? '' : '?';
      let type = input.type;
      
      // Handle object with fields
      if (input.Field) {
        type = `{ ${Array.isArray(input.Field) ? 
          input.Field.map(f => `${f.name}${f.required === 'true' ? '' : '?'}: ${convertType(f.type)}`).join('; ') : 
          `${input.Field.name}${input.Field.required === 'true' ? '' : '?'}: ${convertType(input.Field.type)}`} }`;
      } else {
        type = convertType(type);
      }
      
      return `${input.name}${required}: ${type}`;
    });
    
    methodSignature += params.join(', ');
  }
  
  methodSignature += '): ';
  
  // Return type
  if (method.Output) {
    if (method.Output.Field) {
      methodSignature += `{ ${Array.isArray(method.Output.Field) ? 
        method.Output.Field.map(f => `${f.name}: ${convertType(f.type)}`).join('; ') : 
        `${method.Output.Field.name}: ${convertType(method.Output.Field.type)}`} }`;
    } else {
      methodSignature += convertType(method.Output.type);
    }
  } else {
    methodSignature += 'void';
  }
  
  // Make async if specified
  if (method.Async === 'true') {
    // Wrap return type in Promise
    methodSignature = methodSignature.replace(/\):\s*(.+)$/, '): Promise<$1>');
  }
  
  methodSignature += ';\n\n';
  return methodSignature;
}

/**
 * Generate TypeScript event handler signature
 * @param {Object} method - APML method data (event)
 * @returns {string} TypeScript event handler signature
 */
function generateEventHandlerSignature(method) {
  let handlerSignature = `  /**\n   * ${method.Description}\n`;
  
  // Add JSDoc for event data
  if (method.EventData) {
    handlerSignature += `   * @param callback - Function to handle the event\n`;
    handlerSignature += `   * @param callback.${method.EventData.name} - ${method.EventData.description}\n`;
  }
  
  handlerSignature += `   */\n`;
  
  // Event handler signature
  handlerSignature += `  ${method.name}(callback: (`;
  
  // Event data parameter
  if (method.EventData) {
    handlerSignature += `${method.EventData.name}: ${convertType(method.EventData.type)}`;
  }
  
  handlerSignature += ') => void): void;\n\n';
  return handlerSignature;
}

/**
 * Generate TypeScript interface definition from APML interface
 * @param {Object} apmlInterface - Parsed APML interface
 * @returns {string} TypeScript interface file content
 */
function generateTypeScriptInterface(apmlInterface) {
  // Extract interface data
  const interfaceData = apmlInterface.Interface;
  const interfaceName = interfaceData.name;
  const moduleName = interfaceData.module;
  
  let tsContent = `/**
 * ${interfaceName}.ts
 * Generated from APML Interface Definition
 * Module: ${moduleName}
 */

`;

  // Add purpose as file comment
  if (interfaceData.Purpose) {
    tsContent += `/**
 * ${interfaceData.Purpose}
 */
`;
  }

  // Generate data structures
  if (interfaceData.DataStructures && interfaceData.DataStructures.Structure) {
    const structures = Array.isArray(interfaceData.DataStructures.Structure) ? 
      interfaceData.DataStructures.Structure : 
      [interfaceData.DataStructures.Structure];
    
    structures.forEach(structure => {
      tsContent += generateInterface(structure);
    });
  }
  
  // Generate error enums
  if (interfaceData.Methods) {
    const methods = Array.isArray(interfaceData.Methods.Method) ? 
      interfaceData.Methods.Method : 
      [interfaceData.Methods.Method];
    
    // Collect all error codes from all methods
    const allErrors = { Error: [] };
    methods.forEach(method => {
      if (method.Errors && method.Errors.Error) {
        const errors = Array.isArray(method.Errors.Error) ? method.Errors.Error : [method.Errors.Error];
        allErrors.Error = [...allErrors.Error, ...errors];
      }
    });
    
    // Generate enum if we have errors
    if (allErrors.Error.length > 0) {
      tsContent += generateErrorEnum(allErrors, interfaceName);
    }
  }
  
  // Generate the main interface
  tsContent += `/**
 * ${interfaceName}
 */
export interface ${interfaceName} {\n`;
  
  // Generate method signatures
  if (interfaceData.Methods && interfaceData.Methods.Method) {
    const methods = Array.isArray(interfaceData.Methods.Method) ? 
      interfaceData.Methods.Method : 
      [interfaceData.Methods.Method];
    
    methods.forEach(method => {
      // Check if this is an event handler (has EventData)
      if (method.EventData) {
        tsContent += generateEventHandlerSignature(method);
      } else {
        tsContent += generateMethodSignature(method);
      }
    });
  }
  
  // Close the interface
  tsContent += `}

// Export default interface
export default ${interfaceName};
`;

  return tsContent;
}

/**
 * Process APML interface file and generate TypeScript interface
 * @param {string} filePath - Path to APML interface file
 * @returns {Promise<void>}
 */
async function processApmlInterfaceFile(filePath) {
  try {
    console.log(`Processing ${filePath}...`);
    
    // Parse APML file
    const apmlData = await parseApmlFile(filePath);
    
    // Generate TypeScript interface
    const tsContent = generateTypeScriptInterface(apmlData);
    
    // Create output file path
    const fileName = path.basename(filePath, '.apml');
    const outputPath = path.join(TS_INTERFACES_OUTPUT_DIR, `${fileName}.ts`);
    
    // Ensure output directory exists
    await mkdirp.mkdirp(TS_INTERFACES_OUTPUT_DIR);
    
    // Write TypeScript interface file
    await writeFile(outputPath, tsContent, 'utf8');
    
    console.log(`Generated ${outputPath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
    throw error;
  }
}

/**
 * Generate index.ts file to export all interfaces
 * @param {string[]} interfaceFiles - Array of interface file names
 * @returns {Promise<void>}
 */
async function generateIndexFile(interfaceFiles) {
  try {
    let indexContent = `/**
 * Generated TypeScript interfaces from APML Interface Definitions
 */

`;
    
    // Add exports for each interface
    interfaceFiles.forEach(file => {
      const interfaceName = path.basename(file, '.ts');
      indexContent += `export { default as ${interfaceName} } from './${interfaceName}';\n`;
    });
    
    // Write index.ts file
    const indexPath = path.join(TS_INTERFACES_OUTPUT_DIR, 'index.ts');
    await writeFile(indexPath, indexContent, 'utf8');
    
    console.log(`Generated ${indexPath}`);
  } catch (error) {
    console.error(`Error generating index file: ${error.message}`);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('APML to TypeScript Interface Converter');
    console.log('======================================');
    console.log(`APML Interfaces Directory: ${APML_INTERFACES_DIR}`);
    console.log(`TypeScript Output Directory: ${TS_INTERFACES_OUTPUT_DIR}`);
    console.log('');
    
    // Check if APML interfaces directory exists
    try {
      await stat(APML_INTERFACES_DIR);
    } catch (error) {
      console.error(`APML interfaces directory not found: ${APML_INTERFACES_DIR}`);
      console.error('Please make sure the directory exists and contains APML interface files.');
      process.exit(1);
    }
    
    // Find all APML interface files
    const apmlFiles = await findApmlInterfaceFiles(APML_INTERFACES_DIR);
    
    if (apmlFiles.length === 0) {
      console.warn(`No APML interface files found in ${APML_INTERFACES_DIR}`);
      process.exit(0);
    }
    
    console.log(`Found ${apmlFiles.length} APML interface files.`);
    
    // Process each APML interface file
    const processPromises = apmlFiles.map(file => processApmlInterfaceFile(file));
    await Promise.all(processPromises);
    
    // Generate index.ts file
    const tsInterfaceFiles = apmlFiles.map(file => 
      path.basename(file, '.apml') + '.ts'
    );
    await generateIndexFile(tsInterfaceFiles);
    
    console.log('');
    console.log('Done! TypeScript interfaces generated successfully.');
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main();