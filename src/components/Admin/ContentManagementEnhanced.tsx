/**
 * Enhanced Content Management Component
 * Manages facts, stitches, and concept-to-tube mappings
 * Implements L1 vision: flexible curriculum design
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  Download, 
  Search,
  Filter,
  Eye,
  Save,
  ArrowLeft,
  Link,
  Shuffle,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface Fact {
  id: string;
  statement: string;
  answer: string;
  operation_type: string;
  operand1: number | null;
  operand2: number | null;
  difficulty_level: number;
  metadata: any;
}

interface Stitch {
  id: string;
  name: string;
  tube_id: string;
  concept_code: string;
  concept_type: string;
  concept_params: any;
  question_format: any;
  surprise_weight: number;
  is_active: boolean;
  min_questions: number;
  max_questions: number;
}

interface ConceptMapping {
  id: string;
  concept_code: string;
  tube_id: string;
  priority: number;
  is_active: boolean;
}

interface ContentManagementProps {
  onBack: () => void;
}

export const ContentManagementEnhanced: React.FC<ContentManagementProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'facts' | 'stitches' | 'mappings' | 'preview'>('facts');
  const [facts, setFacts] = useState<Fact[]>([]);
  const [stitches, setStitches] = useState<Stitch[]>([]);
  const [mappings, setMappings] = useState<ConceptMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOperation, setSelectedOperation] = useState('all');
  const [editingFact, setEditingFact] = useState<Fact | null>(null);
  const [editingStitch, setEditingStitch] = useState<Stitch | null>(null);
  const [editingMapping, setEditingMapping] = useState<ConceptMapping | null>(null);
  const [showFactForm, setShowFactForm] = useState(false);
  const [showStitchForm, setShowStitchForm] = useState(false);
  const [showMappingForm, setShowMappingForm] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    loadContent();
  }, [activeTab]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadContent = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'facts':
          const factsResponse = await fetch('/api/admin/facts');
          const factsData = await factsResponse.json();
          if (factsResponse.ok) {
            setFacts(factsData);
          } else {
            console.error('Failed to load facts:', factsData.error);
            setFacts([]);
          }
          break;

        case 'stitches':
          const stitchesResponse = await fetch('/api/admin/stitches');
          const stitchesData = await stitchesResponse.json();
          if (stitchesResponse.ok) {
            setStitches(stitchesData);
          } else {
            console.error('Failed to load stitches:', stitchesData.error);
            setStitches([]);
          }
          break;

        case 'mappings':
          const mappingsResponse = await fetch('/api/admin/concept-mappings');
          const mappingsData = await mappingsResponse.json();
          if (mappingsResponse.ok) {
            setMappings(mappingsData.mappings);
          } else {
            console.error('Failed to load mappings:', mappingsData.error);
            setMappings([]);
          }
          break;
      }
    } catch (error) {
      console.error('Failed to load content:', error);
      showNotification('error', 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const filteredFacts = facts.filter(fact => {
    const matchesSearch = fact.statement.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fact.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOperation = selectedOperation === 'all' || fact.operation_type === selectedOperation;
    return matchesSearch && matchesOperation;
  });

  const handleCreateFact = async (factData: Omit<Fact, 'id'>) => {
    try {
      const response = await fetch('/api/admin/facts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(factData)
      });
      
      if (response.ok) {
        const newFact = await response.json();
        setFacts([...facts, newFact]);
        setShowFactForm(false);
        showNotification('success', 'Fact created successfully');
      } else {
        const error = await response.json();
        showNotification('error', 'Failed to create fact: ' + error.error);
      }
    } catch (error) {
      showNotification('error', 'Error creating fact');
    }
  };

  const handleUpdateFact = async (id: string, factData: Partial<Fact>) => {
    try {
      const response = await fetch('/api/admin/facts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...factData })
      });
      
      if (response.ok) {
        const updatedFact = await response.json();
        setFacts(facts.map(f => f.id === id ? updatedFact : f));
        setEditingFact(null);
        showNotification('success', 'Fact updated successfully');
      } else {
        const error = await response.json();
        showNotification('error', 'Failed to update fact: ' + error.error);
      }
    } catch (error) {
      showNotification('error', 'Error updating fact');
    }
  };

  const handleDeleteFact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fact?')) return;
    
    try {
      const response = await fetch('/api/admin/facts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      if (response.ok) {
        setFacts(facts.filter(f => f.id !== id));
        showNotification('success', 'Fact deleted successfully');
      } else {
        const error = await response.json();
        showNotification('error', 'Failed to delete fact: ' + error.error);
      }
    } catch (error) {
      showNotification('error', 'Error deleting fact');
    }
  };

  const handleCreateMapping = async (mappingData: Omit<ConceptMapping, 'id'>) => {
    try {
      const response = await fetch('/api/admin/concept-mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mappingData)
      });
      
      if (response.ok) {
        const newMapping = await response.json();
        setMappings([...mappings, newMapping]);
        setShowMappingForm(false);
        showNotification('success', 'Concept mapping created successfully');
      } else {
        const error = await response.json();
        showNotification('error', 'Failed to create mapping: ' + error.error);
      }
    } catch (error) {
      showNotification('error', 'Error creating mapping');
    }
  };

  const handleUpdateMapping = async (id: string, mappingData: Partial<ConceptMapping>) => {
    try {
      const response = await fetch(`/api/admin/concept-mappings?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mappingData)
      });
      
      if (response.ok) {
        const updatedMapping = await response.json();
        setMappings(mappings.map(m => m.id === id ? updatedMapping : m));
        setEditingMapping(null);
        showNotification('success', 'Mapping updated successfully');
      } else {
        const error = await response.json();
        showNotification('error', 'Failed to update mapping: ' + error.error);
      }
    } catch (error) {
      showNotification('error', 'Error updating mapping');
    }
  };

  const handleDeleteMapping = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mapping?')) return;
    
    try {
      const response = await fetch(`/api/admin/concept-mappings?id=${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setMappings(mappings.filter(m => m.id !== id));
        showNotification('success', 'Mapping deleted successfully');
      } else {
        const error = await response.json();
        showNotification('error', 'Failed to delete mapping: ' + error.error);
      }
    } catch (error) {
      showNotification('error', 'Error deleting mapping');
    }
  };

  const operationTypes = ['all', 'double', 'half', 'multiplication', 'addition', 'subtraction', 'division'];

  const renderFactsTab = () => (
    <div className="space-y-6">
      {/* Facts Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Mathematical Facts</h2>
          <p className="text-gray-400 mt-1">Manage the foundation facts for question generation</p>
        </div>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white transition-all">
            <Upload className="w-4 h-4 mr-2" />
            Import Facts
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white transition-all">
            <Download className="w-4 h-4 mr-2" />
            Export Facts
          </button>
          <button 
            onClick={() => setShowFactForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Fact
          </button>
        </div>
      </div>

      {/* Facts Filters */}
      <div className="flex space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search facts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg focus:ring-blue-400 focus:border-blue-400 focus:outline-none"
          />
        </div>
        <select
          value={selectedOperation}
          onChange={(e) => setSelectedOperation(e.target.value)}
          className="px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-blue-400 focus:border-blue-400 focus:outline-none"
        >
          {operationTypes.map(op => (
            <option key={op} value={op}>
              {op === 'all' ? 'All Operations' : op.charAt(0).toUpperCase() + op.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Facts Table */}
      <div className="bg-gray-900 shadow-lg rounded-xl overflow-hidden border border-gray-800">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Fact ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Statement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Answer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Operation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Difficulty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-800">
            {filteredFacts.map((fact) => (
              <tr key={fact.id} className="hover:bg-gray-800/50 transition-all">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                  {fact.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {fact.statement}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {fact.answer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    fact.operation_type === 'double' ? 'bg-blue-400/20 text-blue-400' :
                    fact.operation_type === 'half' ? 'bg-green-400/20 text-green-400' :
                    fact.operation_type === 'multiplication' ? 'bg-purple-400/20 text-purple-400' :
                    'bg-gray-700 text-gray-400'
                  }`}>
                    {fact.operation_type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  Level {fact.difficulty_level}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setEditingFact(fact)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteFact(fact.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fact Form Modal */}
      {(showFactForm || editingFact) && (
        <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-medium mb-4 text-white">
              {editingFact ? 'Edit Fact' : 'Create New Fact'}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const factData = {
                  statement: formData.get('statement') as string,
                  answer: formData.get('answer') as string,
                  operation_type: formData.get('operation_type') as string,
                  operand1: Number(formData.get('operand1')),
                  operand2: Number(formData.get('operand2')),
                  difficulty_level: Number(formData.get('difficulty_level')),
                  metadata: {}
                };
                
                if (editingFact) {
                  handleUpdateFact(editingFact.id, factData);
                } else {
                  handleCreateFact(factData);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-400">Statement</label>
                <input
                  name="statement"
                  type="text"
                  defaultValue={editingFact?.statement}
                  required
                  className="mt-1 block w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Answer</label>
                <input
                  name="answer"
                  type="text"
                  defaultValue={editingFact?.answer}
                  required
                  className="mt-1 block w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Operation Type</label>
                <select
                  name="operation_type"
                  defaultValue={editingFact?.operation_type || 'addition'}
                  className="mt-1 block w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none"
                >
                  <option value="addition">Addition</option>
                  <option value="subtraction">Subtraction</option>
                  <option value="multiplication">Multiplication</option>
                  <option value="division">Division</option>
                  <option value="double">Double</option>
                  <option value="half">Half</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400">Operand 1</label>
                  <input
                    name="operand1"
                    type="number"
                    defaultValue={editingFact?.operand1 || 0}
                    className="mt-1 block w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Operand 2</label>
                  <input
                    name="operand2"
                    type="number"
                    defaultValue={editingFact?.operand2 || 0}
                    className="mt-1 block w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Difficulty Level</label>
                <input
                  name="difficulty_level"
                  type="number"
                  min="1"
                  max="5"
                  defaultValue={editingFact?.difficulty_level || 1}
                  required
                  className="mt-1 block w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowFactForm(false);
                    setEditingFact(null);
                  }}
                  className="px-4 py-2 border border-gray-700 rounded-lg text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  {editingFact ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderStitchesTab = () => (
    <div className="space-y-6">
      {/* Stitches Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Learning Stitches</h2>
          <p className="text-gray-400 mt-1">Manage content recipes for dynamic question generation</p>
        </div>
        <button 
          onClick={() => setShowStitchForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Stitch
        </button>
      </div>

      {/* Stitches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stitches.map((stitch) => (
          <div key={stitch.id} className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6 hover:border-gray-700 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{stitch.name}</h3>
                <p className="text-sm text-gray-500">{stitch.id}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                stitch.is_active ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
              }`}>
                {stitch.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-400"><span className="text-gray-300">Tube:</span> {stitch.tube_id}</p>
              <p className="text-sm text-gray-400"><span className="text-gray-300">Concept:</span> {stitch.concept_code}</p>
              <p className="text-sm text-gray-400"><span className="text-gray-300">Type:</span> {stitch.concept_type}</p>
              <p className="text-sm text-gray-400"><span className="text-gray-300">Questions:</span> {stitch.min_questions}-{stitch.max_questions}</p>
              <p className="text-sm text-gray-400"><span className="text-gray-300">Surprise Weight:</span> {(stitch.surprise_weight * 100).toFixed(1)}%</p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setEditingStitch(stitch)}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button className="text-red-400 hover:text-red-300 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMappingsTab = () => {
    // Group mappings by concept
    const conceptGroups = mappings.reduce((acc, mapping) => {
      if (!acc[mapping.concept_code]) {
        acc[mapping.concept_code] = [];
      }
      acc[mapping.concept_code].push(mapping);
      return acc;
    }, {} as Record<string, ConceptMapping[]>);

    return (
      <div className="space-y-6">
        {/* Mappings Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Concept-to-Tube Mappings</h2>
            <p className="text-gray-400 mt-1">Flexibly assign concepts to any tube with priorities</p>
          </div>
          <button 
            onClick={() => setShowMappingForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all"
          >
            <Link className="w-4 h-4 mr-2" />
            Add Mapping
          </button>
        </div>

        {/* Concept Groups */}
        <div className="space-y-4">
          {Object.entries(conceptGroups).map(([conceptCode, conceptMappings]) => (
            <div key={conceptCode} className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Concept {conceptCode}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['tube1', 'tube2', 'tube3'].map(tubeId => {
                  const mapping = conceptMappings.find(m => m.tube_id === tubeId);
                  
                  return (
                    <div 
                      key={tubeId} 
                      className={`border-2 rounded-lg p-4 transition-all ${
                        mapping && mapping.is_active 
                          ? 'border-blue-400 bg-blue-400/10' 
                          : 'border-gray-700 bg-gray-800/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-200">{tubeId}</h4>
                        {mapping && (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            mapping.is_active 
                              ? 'bg-green-400/20 text-green-400' 
                              : 'bg-red-400/20 text-red-400'
                          }`}>
                            {mapping.is_active ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </div>
                      
                      {mapping ? (
                        <div>
                          <p className="text-sm text-gray-400">Priority: {mapping.priority}</p>
                          <div className="mt-2 flex space-x-2">
                            <button 
                              onClick={() => setEditingMapping(mapping)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={() => handleDeleteMapping(mapping.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            setShowMappingForm(true);
                            // Pre-fill form with concept and tube
                          }}
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          + Add to {tubeId}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Mapping Form Modal */}
        {(showMappingForm || editingMapping) && (
          <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-medium mb-4 text-white">
                {editingMapping ? 'Edit Mapping' : 'Create Concept Mapping'}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const mappingData = {
                    concept_code: formData.get('concept_code') as string,
                    tube_id: formData.get('tube_id') as string,
                    priority: Number(formData.get('priority')),
                    is_active: formData.get('is_active') === 'true'
                  };
                  
                  if (editingMapping) {
                    handleUpdateMapping(editingMapping.id, mappingData);
                  } else {
                    handleCreateMapping(mappingData);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-400">Concept Code</label>
                  <input
                    name="concept_code"
                    type="text"
                    defaultValue={editingMapping?.concept_code}
                    required
                    placeholder="e.g., 0001"
                    className="mt-1 block w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Tube</label>
                  <select
                    name="tube_id"
                    defaultValue={editingMapping?.tube_id || 'tube1'}
                    className="mt-1 block w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none"
                  >
                    <option value="tube1">Tube 1</option>
                    <option value="tube2">Tube 2</option>
                    <option value="tube3">Tube 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Priority (0-1000)</label>
                  <input
                    name="priority"
                    type="number"
                    min="0"
                    max="1000"
                    defaultValue={editingMapping?.priority || 100}
                    required
                    className="mt-1 block w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">Higher priority concepts appear first</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Status</label>
                  <select
                    name="is_active"
                    defaultValue={editingMapping?.is_active?.toString() || 'true'}
                    className="mt-1 block w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMappingForm(false);
                      setEditingMapping(null);
                    }}
                    className="px-4 py-2 border border-gray-700 rounded-lg text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  >
                    {editingMapping ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPreviewTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Curriculum Preview</h2>
        <p className="text-gray-400 mt-1">Preview how your curriculum changes affect learners</p>
      </div>
      
      <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6">
        <div className="space-y-4">
          <div className="border-l-4 border-blue-400 pl-4">
            <h3 className="font-semibold text-white">Active Concept Mappings</h3>
            <p className="text-sm text-gray-400 mt-1">
              {mappings.filter(m => m.is_active).length} active mappings across {
                [...new Set(mappings.filter(m => m.is_active).map(m => m.tube_id))].length
              } tubes
            </p>
          </div>
          
          <div className="border-l-4 border-green-400 pl-4">
            <h3 className="font-semibold text-white">Total Facts Available</h3>
            <p className="text-sm text-gray-400 mt-1">{facts.length} mathematical facts</p>
          </div>
          
          <div className="border-l-4 border-purple-400 pl-4">
            <h3 className="font-semibold text-white">Active Stitches</h3>
            <p className="text-sm text-gray-400 mt-1">
              {stitches.filter(s => s.is_active).length} active learning stitches
            </p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-sm text-gray-300">
            <span className="text-gray-200 font-medium">Example:</span> When a learner on tube2 requests content, the system will:
          </p>
          <ol className="mt-2 text-sm text-gray-400 space-y-1 list-decimal list-inside">
            <li>Check concept mappings for tube2</li>
            <li>Select highest priority active concept</li>
            <li>Find matching stitch definition</li>
            <li>Generate questions from available facts</li>
          </ol>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg backdrop-blur-sm ${
          notification.type === 'success' ? 'bg-green-400/90 text-gray-900' : 'bg-red-400/90 text-gray-900'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {notification.message}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gray-900 shadow-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Content Management</h1>
                <p className="text-gray-400 mt-1">Manage curriculum with full flexibility</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'facts', label: 'Facts', count: facts.length },
              { id: 'stitches', label: 'Stitches', count: stitches.length },
              { id: 'mappings', label: 'Mappings', count: mappings.length },
              { id: 'preview', label: 'Preview', count: 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-800 text-gray-300 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {activeTab === 'facts' && renderFactsTab()}
            {activeTab === 'stitches' && renderStitchesTab()}
            {activeTab === 'mappings' && renderMappingsTab()}
            {activeTab === 'preview' && renderPreviewTab()}
          </>
        )}
      </main>
    </div>
  );
};

export default ContentManagementEnhanced;