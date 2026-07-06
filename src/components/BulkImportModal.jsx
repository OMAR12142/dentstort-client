import React, { useState, useRef } from 'react';
import Modal from './Modal';
import { Upload, AlertCircle, FileSpreadsheet, CheckCircle2, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useBulkImportPatients } from '../hooks/usePatients';
import toast from 'react-hot-toast';

export default function BulkImportModal({ open, onClose }) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef(null);

  const { mutateAsync: importPatients, isPending } = useBulkImportPatients();

  // Smart Column Mapping Logic
  const mapRowToPatient = (row) => {
    // Helper to find a value based on possible keys (case-insensitive)
    const findValue = (possibleKeys) => {
      const foundKey = Object.keys(row).find(key => 
        possibleKeys.some(pk => key.toLowerCase().includes(pk.toLowerCase()))
      );
      return foundKey ? row[foundKey] : undefined;
    };

    const name = findValue(['name', 'full name', 'patient name']);
    const dateOfBirth = findValue(['date of birth', 'dob', 'birth date', 'age']);
    const phone = findValue(['phone', 'mobile', 'contact', 'number']);
    const clinic = findValue(['clinic', 'branch', 'nic']);
    const insuranceCompany = findValue(['insurance', 'insurance company', 'rance']);
    const address = findValue(['address', 'location']);
    const job = findValue(['job', 'occupation', 'ob']);
    const statusStr = findValue(['status', 'state']);
    
    // Clean up status
    let status = 'Active';
    if (statusStr) {
      const s = String(statusStr).toLowerCase();
      if (s.includes('active')) status = 'Active';
      if (s.includes('hold')) status = 'On-Hold';
      if (s.includes('complete')) status = 'Completed';
      if (s.includes('drop')) status = 'Dropped';
    }

    // Convert date if possible
    let parsedDob = undefined;
    if (dateOfBirth) {
       // if it's a number (Excel date), convert it, else string
       if (typeof dateOfBirth === 'number') {
         // Excel serial date to JS Date
         parsedDob = new Date(Math.round((dateOfBirth - 25569) * 86400 * 1000)).toISOString();
       } else {
         parsedDob = String(dateOfBirth);
       }
    }

    return {
      name: name ? String(name).trim() : null,
      dateOfBirth: parsedDob,
      phone: phone ? String(phone).trim() : undefined,
      insuranceCompany: insuranceCompany ? String(insuranceCompany).trim() : undefined,
      address: address ? String(address).trim() : undefined,
      job: job ? String(job).trim() : undefined,
      status
    };
  };

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const parseFile = (file) => {
    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to JSON
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        
        // Map to DentStory format and filter out invalid rows
        const mappedData = rawJson.map(mapRowToPatient).filter(p => !!p.name);
        setParsedData(mappedData);
      } catch (error) {
        toast.error("Failed to parse file. Ensure it's a valid CSV or Excel.");
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;
    try {
      await importPatients(parsedData);
      toast.success(`Successfully imported ${parsedData.length} patients!`);
      onClose();
      // Reset state for next open
      setFile(null);
      setParsedData([]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Import failed.');
    }
  };

  const resetModal = () => {
    setFile(null);
    setParsedData([]);
    onClose();
  };

  return (
    <Modal open={open} onClose={resetModal} title="Import Patients" size="lg">
      <div className="space-y-6">
        
        {/* Upload Area */}
        {!file && (
          <div 
            className="border-2 border-dashed border-base-content/20 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
              className="hidden" 
            />
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              <Upload size={32} />
            </div>
            <h3 className="text-lg font-bold text-base-content mb-1">Click to Upload</h3>
            <p className="text-sm text-base-content/60 text-center max-w-sm">
              Upload your .csv or .xlsx file. We will automatically map Name, Phone, DOB, Job, Address, and more.
            </p>
          </div>
        )}

        {/* Preview Area */}
        {file && !isParsing && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-base-200/50 p-4 rounded-xl border border-neutral-light/50">
              <div className="flex items-center gap-3">
                <FileSpreadsheet size={24} className="text-primary" />
                <div>
                  <p className="font-bold text-sm text-base-content">{file.name}</p>
                  <p className="text-xs text-success flex items-center gap-1 font-semibold mt-0.5">
                    <CheckCircle2 size={12} /> Found {parsedData.length} valid patients
                  </p>
                </div>
              </div>
              <button onClick={() => setFile(null)} className="btn btn-sm btn-ghost text-base-content/60 px-2">
                <X size={16} /> Clear
              </button>
            </div>

            {parsedData.length > 0 ? (
              <div className="border border-neutral-light/50 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                <table className="table table-sm w-full text-xs">
                  <thead className="bg-base-200/50 sticky top-0">
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Job</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 50).map((p, i) => (
                      <tr key={i}>
                        <td className="font-semibold">{p.name}</td>
                        <td className="text-base-content/60">{p.phone || '—'}</td>
                        <td className="text-base-content/60">{p.job || '—'}</td>
                        <td>{p.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 50 && (
                  <div className="text-center p-2 text-xs text-base-content/50 bg-base-200/30">
                    Showing 50 of {parsedData.length}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-error/10 text-error rounded-xl flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p className="text-sm font-medium">Could not find any valid names. Please ensure your spreadsheet has a "Name" or "Full Name" column.</p>
              </div>
            )}

            <div className="pt-4 flex justify-end gap-3">
              <button onClick={resetModal} className="btn btn-ghost">Cancel</button>
              <button 
                onClick={handleImport} 
                disabled={parsedData.length === 0 || isPending}
                className="btn btn-primary"
              >
                {isPending ? 'Importing...' : `Import ${parsedData.length} Patients`}
              </button>
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
}
