/**
 * Content Management Component
 * Manages facts, stitches, and tube positions
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
  ArrowLeft
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
  concept_type: string;
  concept_params: any;
  surprise_weight: number;
  is_active: boolean;
}

interface ContentManagementProps {
  onBack: () => void;
}

export const ContentManagement: React.FC<ContentManagementProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'facts' | 'stitches' | 'positions'>('facts');
  const [facts, setFacts] = useState<Fact[]>([]);
  const [stitches, setStitches] = useState<Stitch[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOperation, setSelectedOperation] = useState('all');
  const [editingFact, setEditingFact] = useState<Fact | null>(null);
  const [showFactForm, setShowFactForm] = useState(false);

  useEffect(() => {
    loadContent();
  }, [activeTab]);

  const loadContent = async () => {
    setLoading(true);
    try {
      if (activeTab === 'facts') {
        // Use actual API call
        const response = await fetch('/api/admin/facts');
        const data = await response.json();
        
        if (response.ok) {
          setFacts(data);
        } else {
          console.error('Failed to load facts:', data.error);
          // Fallback to empty array on error
          setFacts([]);
        }
      } else if (activeTab === 'stitches') {
        // Mock stitches data
        setStitches([
          {
            id: 't1-0001-0002',
            name: 'Double Numbers to 10',
            tube_id: 'tube1',
            concept_type: 'double',
            concept_params: { min: 1, max: 10 },
            surprise_weight: 0.05,
            is_active: true
          },
          {
            id: 't1-0001-0004',
            name: 'Half of Numbers to 20',
            tube_id: 'tube1',
            concept_type: 'half',
            concept_params: { min: 2, max: 20 },
            surprise_weight: 0.05,
            is_active: true
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load content:', error);
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
        console.log('✅ Fact created successfully');
      } else {
        const error = await response.json();
        console.error('Failed to create fact:', error);
        alert('Failed to create fact: ' + error.error);
      }
    } catch (error) {
      console.error('Error creating fact:', error);
      alert('Error creating fact');
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
        console.log('✅ Fact updated successfully');
      } else {
        const error = await response.json();
        console.error('Failed to update fact:', error);
        alert('Failed to update fact: ' + error.error);
      }
    } catch (error) {
      console.error('Error updating fact:', error);
      alert('Error updating fact');
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
        console.log('✅ Fact deleted successfully');
      } else {
        const error = await response.json();
        console.error('Failed to delete fact:', error);
        alert('Failed to delete fact: ' + error.error);
      }
    } catch (error) {
      console.error('Error deleting fact:', error);
      alert('Error deleting fact');
    }
  };

  const operationTypes = ['all', 'double', 'half', 'multiplication', 'addition', 'subtraction', 'division'];

  const renderFactsTab = () => (
    <div className="space-y-6">
      {/* Facts Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mathematical Facts</h2>
          <p className="text-gray-600 mt-1">Manage the foundation facts for question generation</p>
        </div>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Upload className="w-4 h-4 mr-2" />
            Import Facts
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export Facts
          </button>
          <button 
            onClick={() => setShowFactForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Fact
          </button>
        </div>
      </div>

      {/* Facts Filters */}
      <div className="flex space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search facts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={selectedOperation}
          onChange={(e) => setSelectedOperation(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          {operationTypes.map(op => (
            <option key={op} value={op}>
              {op === 'all' ? 'All Operations' : op.charAt(0).toUpperCase() + op.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Facts Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fact ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Answer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Operation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difficulty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredFacts.map((fact) => (
              <tr key={fact.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {fact.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {fact.statement}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {fact.answer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    fact.operation_type === 'double' ? 'bg-blue-100 text-blue-800' :
                    fact.operation_type === 'half' ? 'bg-green-100 text-green-800' :
                    fact.operation_type === 'multiplication' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {fact.operation_type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Level {fact.difficulty_level}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        alert(`Fact Details:\n\nID: ${fact.id}\nStatement: ${fact.statement}\nAnswer: ${fact.answer}\nOperation: ${fact.operation_type}\nDifficulty: ${fact.difficulty_level}\n\nOperands: ${fact.operand1} and ${fact.operand2}`);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setEditingFact(fact)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteFact(fact.id)}
                      className="text-red-600 hover:text-red-900"
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

      {/* Create/Edit Fact Modal */}
      {(showFactForm || editingFact) && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
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
                <label className="block text-sm font-medium text-gray-700">Statement</label>
                <input
                  name="statement"
                  type="text"
                  defaultValue={editingFact?.statement}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Answer</label>
                <input
                  name="answer"
                  type="text"
                  defaultValue={editingFact?.answer}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Operation Type</label>
                <select
                  name="operation_type"
                  defaultValue={editingFact?.operation_type || 'addition'}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
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
                  <label className="block text-sm font-medium text-gray-700">Operand 1</label>
                  <input
                    name="operand1"
                    type="number"
                    defaultValue={editingFact?.operand1 || 0}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Operand 2</label>
                  <input
                    name="operand2"
                    type="number"
                    defaultValue={editingFact?.operand2 || 0}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Difficulty Level</label>
                <input
                  name="difficulty_level"
                  type="number"
                  min="1"
                  max="5"
                  defaultValue={editingFact?.difficulty_level || 1}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowFactForm(false);
                    setEditingFact(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
          <h2 className="text-2xl font-bold text-gray-900">Learning Stitches</h2>
          <p className="text-gray-600 mt-1">Manage content recipes for dynamic question generation</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Stitch
        </button>
      </div>

      {/* Stitches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stitches.map((stitch) => (
          <div key={stitch.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{stitch.name}</h3>
                <p className="text-sm text-gray-600">{stitch.id}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                stitch.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {stitch.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm"><strong>Tube:</strong> {stitch.tube_id}</p>
              <p className="text-sm"><strong>Type:</strong> {stitch.concept_type}</p>
              <p className="text-sm"><strong>Surprise Weight:</strong> {(stitch.surprise_weight * 100).toFixed(1)}%</p>
              <p className="text-sm"><strong>Parameters:</strong> {JSON.stringify(stitch.concept_params)}</p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button className="text-blue-600 hover:text-blue-900">
                <Eye className="w-4 h-4" />
              </button>
              <button className="text-indigo-600 hover:text-indigo-900">
                <Edit3 className="w-4 h-4" />
              </button>
              <button className="text-red-600 hover:text-red-900">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPositionsTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tube Positions</h2>
        <p className="text-gray-600 mt-1">Manage default learning progressions for each tube</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Tube position management interface coming soon...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
                <p className="text-gray-600 mt-1">Manage facts, stitches, and learning progressions</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'facts', label: 'Facts', count: facts.length },
              { id: 'stitches', label: 'Stitches', count: stitches.length },
              { id: 'positions', label: 'Positions', count: 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
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
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {activeTab === 'facts' && renderFactsTab()}
            {activeTab === 'stitches' && renderStitchesTab()}
            {activeTab === 'positions' && renderPositionsTab()}
          </>
        )}
      </main>
    </div>
  );
};

export default ContentManagement;