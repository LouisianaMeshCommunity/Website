"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Wifi,
  Smartphone,
  ArrowRight,
  Usb,
  Loader2,
  RefreshCw,
  CheckCircle,
  Settings,
  ChevronLeft,
  AlertTriangle,
  MapPin,
  Ruler,
  Mail,
  Map as MapIcon,
  Cpu,
  Lock,
  Zap,
  Terminal as TerminalIcon,
  X
} from 'lucide-react';

// Real flashing dependencies (dynamic import to avoid SSR issues if any, but "use client" handles it)
import { ESPLoader, Transport } from 'esptool-js';

// ==========================================
// MOCK NODE.JS BACKEND CALLS (PLACEHOLDERS)
// ==========================================
const backendAPI = {
  saveDeviceConfig: async (name: string) => {
    console.log(`NODEJS: Saving device name '${name}' to database/device...`);
    return new Promise(resolve => setTimeout(resolve, 1000));
  },
  saveRepeaterConfig: async (config: any) => {
    console.log(`NODEJS: Saving repeater config to database:`, config);
    return new Promise(resolve => setTimeout(resolve, 1500));
  }
};

// ==========================================
// WIZARD UI COMPONENT
// ==========================================

export default function SetupWizard() {
  const [step, setStep] = useState('intro');
  const [deviceName, setDeviceName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [flashProgress, setFlashProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // Serial API state (UI only)
  const [isCompatible, setIsCompatible] = useState<boolean | null>(null);
  const [serialStatus, setSerialStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

  // Hardware Refs (for actual logic)
  const portRef = useRef<any>(null);
  const transportRef = useRef<Transport | null>(null);
  const esploaderRef = useRef<ESPLoader | null>(null);

  // Terminal state
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const terminalLogsRef = useRef<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const keepReading = useRef<boolean>(true);

  // Repeater specific state
  const [repeaterConfig, setRepeaterConfig] = useState({
    name: '',
    locationSet: false,
    locX: 50,
    locY: 50,
    height: '',
    email: '',
    password: ''
  });

  // Check for Web Serial compatibility on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsCompatible('serial' in navigator);
    }
  }, []);

  // Update real logs state from ref
  const addLog = (msg: string) => {
    // Basic terminal coloring/formatting could be added here
    terminalLogsRef.current = [...terminalLogsRef.current.slice(-200), msg];
    setTerminalLogs([...terminalLogsRef.current]);
  };

  // Scroll to bottom of terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  // Web Serial Connection Logic
  const handleConnectSerial = async () => {
    if (!('serial' in navigator)) return;

    setSerialStatus('connecting');
    try {
      // @ts-ignore
      const selectedPort = await navigator.serial.requestPort();

      // Guard: If the port is already open (e.g. from a previous successful connection), 
      // check readable/writable before attempting to open it again.
      if (!selectedPort.readable) {
        await selectedPort.open({ baudRate: 115200 });
      }

      portRef.current = selectedPort;
      setSerialStatus('connected');

      // Initialize transport for ESPTool
      const transport = new Transport(selectedPort);
      transportRef.current = transport;

      addLog("[SYSTEM] Port connected successfully.\n");
      startReading(selectedPort);
    } catch (err) {
      console.error('Serial connection failed:', err);
      setSerialStatus('error');
      addLog(`[ERROR] Connection failed: ${err}\n`);
    }
  };

  const startReading = async (selectedPort: any) => {
    keepReading.current = true;
    while (selectedPort.readable && keepReading.current) {
      const reader = selectedPort.readable.getReader();
      readerRef.current = reader;
      try {
        while (keepReading.current) {
          const { value, done } = await reader.read();
          if (done) break;
          const decoded = new TextDecoder().decode(value);
          addLog(decoded);
        }
      } catch (err) {
        console.error("Serial read error:", err);
        break;
      } finally {
        reader.releaseLock();
        readerRef.current = null;
      }
    }
  };

  const handleSendTestPacket = async () => {
    const port = portRef.current;
    if (!port || !port.writable) return;

    const writer = port.writable.getWriter();
    const data = new TextEncoder().encode("LMESH_TEST_PACKET\n");

    try {
      await writer.write(data);
      addLog("[DEBUG] Sent test packet: LMESH_TEST_PACKET\n");
    } catch (err) {
      console.error("Failed to send data:", err);
      addLog(`[ERROR] Send failed: ${err}\n`);
    } finally {
      writer.releaseLock();
    }
  };

  // Real Flashing Logic for ESP32
  const handleFlashReal = async () => {
    if (isProcessing || !portRef.current || !transportRef.current) {
      return;
    }

    const type = step.startsWith('client') ? 'client' : 'repeater';
    goTo(type === 'client' ? 'client_flashing' : 'repeater_flashing');
    setIsProcessing(true);
    setFlashProgress(0);

    // Stop our background terminal reader so esptool can take over
    keepReading.current = false;
    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch (e) {
        console.error("Reader cancel error:", e);
      }

      // Wait for the reader finally block to run and release the lock (nullify readerRef)
      let waitCount = 0;
      while (readerRef.current !== null && waitCount < 20) {
        await new Promise(r => setTimeout(r, 50));
        waitCount++;
      }
      // Small stabilization pause
      await new Promise(r => setTimeout(r, 100));
    }

    // Crucial: Close the port if it's open so esptool can take over
    const activePort = portRef.current;
    if (activePort) {
      try {
        await activePort.close();
      } catch (e) {
        console.error("Error closing port before flash:", e);
      }
    }

    const binPath = `/firmware/${selectedDevice}/${type}/firmware.bin`;

    try {
      // 1. Fetch the binary
      addLog(`[FLASH] Fetching firmware: ${binPath}\n`);
      const response = await fetch(binPath);
      if (!response.ok) throw new Error(`Firmware not found at ${binPath}. Ensure it exists in public/firmware/...`);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const firmwareData = new Uint8Array(arrayBuffer);
      addLog(`[FLASH] Binary loaded (${firmwareData.length} bytes)\n`);

      // 2. Prepare ESP Loader
      addLog("\n--- BOOTLOADER HANDSHAKE STARTS ---\n");

      const espLoaderTerminal = {
        clean: () => {
          // terminalLogsRef.current = [];
          // setTerminalLogs([]);
        },
        writeLine: (data: string) => addLog(data + "\n"),
        write: (data: string) => addLog(data)
      };

      const esploader = new ESPLoader({
        transport: transportRef.current!,
        baudrate: 115200,
        terminal: espLoaderTerminal,
        romBaudrate: 115200
      });
      esploaderRef.current = esploader;

      // 3. Connect to Bootloader
      await esploader.main();
      addLog(`[FLASH] Connected to chip: ${esploader.chip.CHIP_NAME}\n`);

      // 4. Write Flash
      // esptool-js (some versions) expects binary string instead of Uint8Array for file data
      const imageBstr = esploader.ui8ToBstr(firmwareData);

      const flashOptions = {
        fileArray: [{ data: imageBstr, address: 0x0 }],
        flashSize: 'keep',
        flashMode: 'keep',
        flashFreq: 'keep',
        eraseAll: false,
        calculateMD5Hash: (image: string) => "",
        reportProgress: (fileIndex: number, written: number, total: number) => {
          const progress = (written / total) * 100;
          setFlashProgress(progress);
        },
        compress: true
      };

      addLog("[FLASH] Erasing and writing flash...\n");
      await esploader.writeFlash(flashOptions);

      addLog("\n--- FLASHING SUCCESSFUL ---\n");

      setIsProcessing(false);

      // Delay slightly before moving to restart page so they can see "SUCCESS"
      setTimeout(() => {
        setSerialStatus('disconnected');
        portRef.current = null;
        goTo(type === 'client' ? 'client_restart' : 'repeater_restart');
      }, 1500);

    } catch (err: any) {
      console.error("Flashing error:", err);
      const msg = err.message || err.toString();
      addLog(`\n[FATAL ERROR] ${msg}\n`);
      setErrorMsg(msg);
      setIsProcessing(false);

      // Navigate to error state
      setTimeout(() => {
        setSerialStatus('disconnected');
        portRef.current = null;
        goTo(type === 'client' ? 'client_error' : 'repeater_error');
      }, 100);
    } finally {
      // Release the port from esptool so it can be re-opened for terminal reading
      if (transportRef.current) {
        try {
          await transportRef.current.disconnect();
        } catch (e) { }
      }
    }
  };

  // Helper to change steps
  const goTo = (nextStep: string) => setStep(nextStep);

  const getProgress = () => {
    const steps: Record<string, number> = {
      intro: 0,
      client_explain: 10, client_select_device: 20, client_connect: 35, client_flashing: 50, client_error: 50, client_restart: 70, client_name: 85, client_ready: 100,
      repeater_explain: 10, repeater_select_device: 20, repeater_connect: 35, repeater_flashing: 50, repeater_error: 50, repeater_restart: 70, repeater_config: 85, repeater_ready: 100
    };
    return steps[step] || 0;
  };

  const availableDevices = [
    { id: 'heltec-v3', name: 'Heltec V3', supported: true },
    { id: 'heltec-v4', name: 'Heltec V4', supported: true },
    { id: 't-1000e', name: 'T-1000E', supported: false },
    { id: 'seeed-p1', name: 'SeeedStudio P1', supported: false }
  ];

  // ==========================================
  // SHARED UI COMPONENTS
  // ==========================================

  const renderCompatibilityWarning = () => {
    if (isCompatible === false) {
      return (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start animate-in fade-in slide-in-from-top-2 text-left">
          <AlertTriangle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-semibold text-red-900 text-sm">Browser Not Compatible</h3>
            <p className="text-red-700 text-xs mt-1">
              Your browser does not support the Web Serial API. Please use a Chromium-based browser (like Chrome, Edge, or Brave).
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderTerminal = () => (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all ${showTerminal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="w-full max-w-3xl bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[65vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-2 text-gray-300">
            <TerminalIcon size={18} />
            <span className="font-mono text-sm font-semibold">ESP32 Flash Terminal</span>
          </div>
          <button onClick={() => setShowTerminal(false)} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed text-emerald-400 bg-black scrollbar-thin scrollbar-thumb-gray-800">
          {terminalLogs.map((log, i) => (
            <span key={i} className="whitespace-pre-wrap">{log}</span>
          ))}
          <div ref={terminalEndRef} />
        </div>
        <div className="px-6 py-3 bg-gray-900 border-t border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Device: {selectedDevice || 'None'}</span>
            {isProcessing && (
              <span className="text-[10px] text-blue-400 uppercase tracking-widest animate-pulse">Flashing in progress...</span>
            )}
          </div>
          <button
            onClick={() => { terminalLogsRef.current = []; setTerminalLogs([]); }}
            className="text-xs text-gray-500 hover:text-white underline"
          >
            Clear Logs
          </button>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // FLOW RENDERING (ABRIDGED FOR READABILITY)
  // ==========================================

  const renderIntro = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome to LMESH</h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Choose the type of node you want to set up today.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <button onClick={() => goTo('client_explain')} className="group p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-blue-500 transition-all text-left">
          <Smartphone size={28} className="text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-1">Setup a Client</h3>
          <p className="text-gray-500 text-sm">Personal gateway node.</p>
        </button>
        <button onClick={() => goTo('repeater_explain')} className="group p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-indigo-500 transition-all text-left">
          <Wifi size={28} className="text-indigo-600 mb-4" />
          <h3 className="text-xl font-semibold mb-1">Setup a Repeater</h3>
          <p className="text-gray-500 text-sm">Network backbone node.</p>
        </button>
      </div>
    </div>
  );

  const renderClientExplain = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
      <button onClick={() => goTo('intro')} className="text-xs text-gray-400 flex items-center"><ChevronLeft size={14} /> Back</button>
      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
        <h2 className="text-2xl font-bold mb-3">Meshcore Clients</h2>
        <p className="text-gray-600 text-sm mb-4">The client firmware enables your hardware to root packets through the decentralized LMESH network.</p>
      </div>
      <div className="flex justify-end"><button onClick={() => goTo('client_select_device')} className="px-6 py-3 bg-blue-600 text-white rounded-xl">Next: Select Device</button></div>
    </div>
  );

  const renderClientSelectDevice = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
      <button onClick={() => goTo('client_explain')} className="text-xs text-gray-400 flex items-center"><ChevronLeft size={14} /> Back</button>
      <div className="grid grid-cols-2 gap-4">
        {availableDevices.map((d) => (
          <button key={d.id} onClick={() => d.supported && setSelectedDevice(d.id)} className={`p-6 rounded-xl border-2 transition-all relative ${!d.supported ? 'opacity-40 cursor-not-allowed' : selectedDevice === d.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`}>
            {!d.supported && <span className="absolute top-2 right-2 text-[10px] bg-gray-200 px-1 rounded">SOON</span>}
            <Cpu size={24} className="mb-2 mx-auto" strokeWidth={1.5} />
            <span className="block text-center font-bold text-sm tracking-tight">{d.name}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-end"><button onClick={() => goTo('client_connect')} disabled={!selectedDevice} className="px-8 py-3 bg-blue-600 disabled:bg-gray-200 text-white rounded-xl">Next: Connect</button></div>
    </div>
  );

  const renderClientConnect = () => (
    <div className="space-y-8 text-center py-4">
      <button onClick={() => goTo('client_select_device')} className="absolute top-12 left-12 text-xs text-gray-400 flex items-center"><ChevronLeft size={14} /> Back</button>
      <Usb size={48} className="mx-auto text-gray-400 mb-4" />
      <h2 className="text-2xl font-bold">Connect your {selectedDevice}</h2>
      <p className="text-gray-500 text-sm max-w-xs mx-auto">Plug in via USB and click below to unlock the serial port.</p>
      {renderCompatibilityWarning()}
      <div className="flex flex-col items-center gap-4">
        {serialStatus !== 'connected' ? (
          <button onClick={handleConnectSerial} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2">
            {serialStatus === 'connecting' ? <Loader2 className="animate-spin" /> : <Usb size={20} />}
            SELECT SERIAL PORT
          </button>
        ) : (
          <div className="space-y-6 w-full">
            <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-xs font-bold border border-green-200 inline-flex items-center gap-2">
              <CheckCircle size={14} /> READY TO FLASH
            </div>
            <div className="flex justify-center gap-4">
              <button disabled={isProcessing} onClick={handleSendTestPacket} className="p-3 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-colors disabled:opacity-50"><Zap size={20} /></button>
              <button disabled={isProcessing} onClick={handleFlashReal} className="px-12 py-4 bg-gray-900 text-white rounded-2xl font-bold tracking-widest hover:scale-[1.02] transition-transform disabled:bg-gray-400">
                {isProcessing ? "INITIALIZING..." : "START FLASHING"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderClientFlashing = () => (
    <div className="space-y-8 text-center py-10">
      <div className="relative mx-auto w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
          <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364.4" strokeDashoffset={364.4 - (364.4 * flashProgress) / 100} className="text-blue-600 transition-all duration-300" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-gray-900">{Math.round(flashProgress)}%</span>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-1">Writing Firmware</h2>
        <p className="text-gray-400 text-sm">Injecting Meshcore Client to ESP32...</p>
      </div>
      <button onClick={() => setShowTerminal(true)} className="flex items-center gap-2 mx-auto text-xs text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-lg"><TerminalIcon size={14} /> SHOW LIVE TERMINAL</button>
    </div>
  );

  const renderClientError = () => (
    <div className="space-y-8 text-center py-10 animate-in fade-in zoom-in duration-300">
      <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto"><AlertTriangle size={40} /></div>
      <div>
        <h2 className="text-2xl font-bold text-red-900">Flashing Failed</h2>
        <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
          {errorMsg || "An unexpected error occurred during the transfer."}
        </p>
      </div>
      <div className="flex flex-col gap-3 max-w-xs mx-auto">
        <button onClick={() => goTo('client_connect')} className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2">
          <RefreshCw size={18} /> TRY AGAIN
        </button>
        <button onClick={() => setShowTerminal(true)} className="text-xs text-blue-600 font-bold">VIEW DETAILED LOGS</button>
      </div>
    </div>
  );

  const renderClientRestart = () => (
    <div className="space-y-8 text-center py-10">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto"><CheckCircle size={40} /></div>
      <h2 className="text-2xl font-bold">Flashing Successful!</h2>
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 text-left max-w-sm mx-auto">
        <p className="text-xs text-gray-400 uppercase font-black mb-2">Hard Reset Required</p>
        <ul className="text-sm text-gray-600 space-y-2">
          <li className="flex gap-2"><span>1.</span> Unplug USB cable</li>
          <li className="flex gap-2"><span>2.</span> Wait 2 seconds</li>
          <li className="flex gap-2"><span>3.</span> Re-insert USB cable</li>
        </ul>
      </div>
      <div className="flex flex-col items-center gap-4">
        {serialStatus !== 'connected' ? (
          <button onClick={handleConnectSerial} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2">
            <RefreshCw size={20} className={serialStatus === 'connecting' ? 'animate-spin' : ''} />
            RECONNECT DEVICE
          </button>
        ) : (
          <button onClick={() => goTo('client_name')} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold animate-in fade-in scale-in-95 duration-300">PROCEED TO NAMING</button>
        )}
      </div>
    </div>
  );

  const renderClientName = () => (
    <div className="space-y-6 max-w-xs mx-auto">
      <h2 className="text-2xl font-bold text-center">Name your node</h2>
      <input type="text" value={deviceName} onChange={e => setDeviceName(e.target.value)} placeholder="e.g. Ghost-1" className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-blue-600 outline-none transition-colors" />
      <button onClick={() => goTo('client_ready')} disabled={!deviceName} className="w-full py-4 bg-gray-900 disabled:bg-gray-200 text-white rounded-xl font-bold">FINISH SETUP</button>
    </div>
  );

  const renderClientReady = () => (
    <div className="text-center py-10 space-y-6">
      <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-200"><CheckCircle size={48} /></div>
      <h2 className="text-3xl font-black">All Systems Go.</h2>
      <p className="text-gray-500">Your client <span className="text-gray-900 font-bold">{deviceName}</span> is now part of the mesh.</p>
      <button onClick={() => { setStep('intro'); setSerialStatus('disconnected'); portRef.current = null; }} className="text-blue-600 font-bold pt-10">SETUP ANOTHER NODE</button>
    </div>
  );

  // REPEATER FLOW (SAME LOGIC, DIFFERENT COLORS)
  const renderRepeaterExplain = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
      <button onClick={() => goTo('intro')} className="text-xs text-gray-400 flex items-center"><ChevronLeft size={14} /> Back</button>
      <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
        <h2 className="text-2xl font-bold mb-3">Meshcore Repeaters</h2>
        <p className="text-gray-600 text-sm mb-4">Backbone nodes that skip packets across the state. Higher placement equals better range.</p>
      </div>
      <div className="flex justify-end"><button onClick={() => goTo('repeater_select_device')} className="px-6 py-3 bg-indigo-600 text-white rounded-xl">Next: Select Device</button></div>
    </div>
  );

  const renderRepeaterSelectDevice = () => (
    <div className="space-y-6">
      <button onClick={() => goTo('repeater_explain')} className="text-xs text-gray-400 flex items-center"><ChevronLeft size={14} /> Back</button>
      <div className="grid grid-cols-2 gap-4">
        {availableDevices.map((d) => (
          <button key={d.id} onClick={() => d.supported && setSelectedDevice(d.id)} className={`p-6 rounded-xl border-2 transition-all relative ${!d.supported ? 'opacity-40 cursor-not-allowed' : selectedDevice === d.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white'}`}>
            {!d.supported && <span className="absolute top-2 right-2 text-[10px] bg-gray-200 px-1 rounded">SOON</span>}
            <Cpu size={24} className="mb-2 mx-auto" strokeWidth={1.5} />
            <span className="block text-center font-bold text-sm tracking-tight">{d.name}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-end"><button onClick={() => goTo('repeater_connect')} disabled={!selectedDevice} className="px-8 py-3 bg-indigo-600 disabled:bg-gray-200 text-white rounded-xl">Next: Connect</button></div>
    </div>
  );

  const renderRepeaterConnect = () => (
    <div className="space-y-8 text-center py-4">
      <button onClick={() => goTo('repeater_select_device')} className="absolute top-12 left-12 text-xs text-gray-400 flex items-center"><ChevronLeft size={14} /> Back</button>
      <Usb size={48} className="mx-auto text-gray-400 mb-4" />
      <h2 className="text-2xl font-bold">Connect Repeater</h2>
      {renderCompatibilityWarning()}
      {serialStatus !== 'connected' ? (
        <button onClick={handleConnectSerial} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 mx-auto">
          {serialStatus === 'connecting' ? <Loader2 className="animate-spin" /> : <Usb size={20} />}
          SELECT SERIAL PORT
        </button>
      ) : (
        <div className="space-y-6 w-full">
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-xs font-bold border border-green-200 inline-flex items-center gap-2">
            <CheckCircle size={14} /> LINK STABLE
          </div>
          <div className="flex justify-center gap-4">
            <button disabled={isProcessing} onClick={handleSendTestPacket} className="p-3 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-colors disabled:opacity-50"><Zap size={20} /></button>
            <button disabled={isProcessing} onClick={handleFlashReal} className="px-12 py-4 bg-gray-900 text-white rounded-2xl font-bold tracking-widest disabled:bg-gray-400">
              {isProcessing ? "PREPARING..." : "START FLASHING"}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderRepeaterFlashing = () => (
    <div className="space-y-8 text-center py-10">
      <div className="relative mx-auto w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
          <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364.4" strokeDashoffset={364.4 - (364.4 * flashProgress) / 100} className="text-indigo-600 transition-all duration-300" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black text-gray-900">{Math.round(flashProgress)}%</span>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-1">Writing Backbone OS</h2>
        <p className="text-gray-400 text-sm">Streaming packets to ESP32...</p>
      </div>
      <button onClick={() => setShowTerminal(true)} className="flex items-center gap-2 mx-auto text-xs text-indigo-600 font-bold bg-indigo-50 px-4 py-2 rounded-lg"><TerminalIcon size={14} /> SHOW LIVE TERMINAL</button>
    </div>
  );

  // ... (Other repeater steps omitted for brevity, logic follows client structure but with repeater theme/config)
  const renderRepeaterRestart = () => (
    <div className="space-y-8 text-center py-10">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-500"><CheckCircle size={40} /></div>
      <h2 className="text-2xl font-bold">Backbone Ready</h2>
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 text-left max-w-sm mx-auto">
        <p className="text-xs text-gray-400 uppercase font-black mb-2">Hard Reset Required</p>
        <ul className="text-sm text-gray-600 space-y-2">
          <li className="flex gap-2"><span>1.</span> Unplug USB cable</li>
          <li className="flex gap-2"><span>2.</span> Wait 2 seconds</li>
          <li className="flex gap-2"><span>3.</span> Re-insert USB cable</li>
        </ul>
      </div>
      <div className="flex flex-col items-center gap-4">
        {serialStatus !== 'connected' ? (
          <button onClick={handleConnectSerial} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 flex items-center gap-2">
            <RefreshCw size={20} className={serialStatus === 'connecting' ? 'animate-spin' : ''} />
            RECONNECT DEVICE
          </button>
        ) : (
          <button onClick={() => goTo('repeater_config')} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold animate-in fade-in scale-in-95 duration-300">CONFIGURE LOCATION</button>
        )}
      </div>
    </div>
  );

  const handleMapClick = (e: any) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRepeaterConfig({ ...repeaterConfig, locationSet: true, locX: ((e.clientX - rect.left) / rect.width) * 100, locY: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  const renderRepeaterConfig = () => (
    <div className="space-y-4 max-w-sm mx-auto overflow-y-auto px-2 max-h-[70vh]">
      <h2 className="text-xl font-bold text-center">Node Config</h2>
      <input type="text" value={repeaterConfig.name} onChange={e => setRepeaterConfig({ ...repeaterConfig, name: e.target.value })} placeholder="Node Name" className="w-full p-3 rounded-lg border" />
      <div onClick={handleMapClick} className="w-full h-32 bg-emerald-50 relative rounded-lg border-2 border-dashed border-emerald-200">
        {repeaterConfig.locationSet && <MapPin size={24} className="text-indigo-600 absolute" style={{ left: `${repeaterConfig.locX}%`, top: `${repeaterConfig.locY}%`, transform: 'translate(-50%, -100%)' }} />}
        {!repeaterConfig.locationSet && <div className="absolute inset-0 flex items-center justify-center text-[10px] text-emerald-300 font-bold">CLICK TO PIN LOCATION</div>}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input type="number" value={repeaterConfig.height} onChange={e => setRepeaterConfig({ ...repeaterConfig, height: e.target.value })} placeholder="Height (ft)" className="w-full p-3 rounded-lg border text-sm" />
        <input type="email" value={repeaterConfig.email} onChange={e => setRepeaterConfig({ ...repeaterConfig, email: e.target.value })} placeholder="Contact Email" className="w-full p-3 rounded-lg border text-sm" />
      </div>
      <input type="password" value={repeaterConfig.password} onChange={e => setRepeaterConfig({ ...repeaterConfig, password: e.target.value })} placeholder="Admin Password" className="w-full p-3 rounded-lg border" />
      <button onClick={() => goTo('repeater_ready')} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold mt-2">JOIN MESH</button>
    </div>
  );

  const renderRepeaterReady = () => (
    <div className="text-center py-10 space-y-6">
      <div className="w-24 h-24 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-indigo-100"><Wifi size={48} /></div>
      <h2 className="text-3xl font-black">Node Streaming.</h2>
      <p className="text-gray-500">Backbone node <span className="text-gray-900 font-bold">{repeaterConfig.name}</span> is live.</p>
      <button onClick={() => { setStep('intro'); setSerialStatus('disconnected'); portRef.current = null; }} className="text-indigo-600 font-bold pt-10">DASHBOARD</button>
    </div>
  );

  const renderRepeaterError = () => (
    <div className="space-y-8 text-center py-10 animate-in fade-in zoom-in duration-300">
      <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto"><AlertTriangle size={40} /></div>
      <div>
        <h2 className="text-2xl font-bold text-red-900">Backbone Error</h2>
        <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
          {errorMsg || "Failed to inject Backbone OS into the controller."}
        </p>
      </div>
      <div className="flex flex-col gap-3 max-w-xs mx-auto">
        <button onClick={() => goTo('repeater_connect')} className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2">
          <RefreshCw size={18} /> RETRY INJECTION
        </button>
        <button onClick={() => setShowTerminal(true)} className="text-xs text-indigo-600 font-bold">OPEN DEBUG CONSOLE</button>
      </div>
    </div>
  );

  const stepRenderer: Record<string, () => React.ReactNode> = {
    intro: renderIntro,
    client_explain: renderClientExplain, client_select_device: renderClientSelectDevice, client_connect: renderClientConnect,
    client_flashing: renderClientFlashing, client_error: renderClientError, client_restart: renderClientRestart, client_name: renderClientName, client_ready: renderClientReady,
    repeater_explain: renderRepeaterExplain, repeater_select_device: renderRepeaterSelectDevice, repeater_connect: renderRepeaterConnect,
    repeater_flashing: renderRepeaterFlashing, repeater_error: renderRepeaterError, repeater_restart: renderRepeaterRestart, repeater_config: renderRepeaterConfig, repeater_ready: renderRepeaterReady
  };

  return (
    <div className="min-h-screen bg-white md:bg-gray-50 flex items-center justify-center p-0 md:p-4 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="w-full max-w-2xl bg-white md:rounded-[40px] md:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden min-h-[100dvh] md:min-h-[600px] flex flex-col relative border-0 md:border md:border-gray-100">
        <div className="h-1.5 w-full bg-gray-50">
          <div className={`h-full transition-all duration-700 ease-in-out ${step.startsWith('repeater') ? 'bg-indigo-600' : 'bg-blue-600'}`} style={{ width: `${getProgress()}%` }} />
        </div>
        <div className="flex-1 p-8 sm:p-16 flex flex-col justify-center text-gray-900 relative">
          {stepRenderer[step]()}
        </div>
      </div>
      {renderTerminal()}
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
