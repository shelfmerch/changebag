import React, { useState } from 'react';
import axios from 'axios';
import config from '@/config';

const CheckLatestPDF: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckLatestPDF = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Checking latest PDF...');
      const response = await axios.get(`${config.apiUrl}/payments/latest-pdf`);
      setResult(response.data);
      console.log('Latest PDF info:', response.data);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to get latest PDF:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Check Latest PDF</h1>
      
      <div className="space-y-4">
        <button
          onClick={handleCheckLatestPDF}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check Latest PDF'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Latest PDF Info:</h2>
          <div className="bg-gray-100 p-4 rounded">
            <div className="space-y-2">
              <div><strong>File Name:</strong> {result.fileName}</div>
              <div><strong>File Path:</strong> {result.filePath}</div>
              <div><strong>File Size:</strong> {result.fileSize} bytes</div>
              <div><strong>Last Modified:</strong> {new Date(result.lastModified).toLocaleString()}</div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You can open this PDF file directly from the file path to verify the table content.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-semibold mb-2">What this does:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Finds the most recently generated PDF invoice</li>
          <li>Shows the file path where you can access it</li>
          <li>Displays file size and modification time</li>
          <li>Helps verify if the PDF was generated correctly</li>
        </ul>
      </div>
    </div>
  );
};

export default CheckLatestPDF; 