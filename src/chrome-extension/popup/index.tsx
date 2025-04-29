import React, { useState, useEffect } from 'react';
import Switch from 'D:/Peek-A-Tube/src/chrome-extension/popup/Switch';
import { Youtube, Lock, Unlock } from 'lucide-react';

const Popup = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [currentVideoURL, setCurrentVideoURL] = useState('');

  useEffect(() => {
    const getStorageData = async () => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        try {
          const data = await chrome.storage.local.get(['enabled', 'currentYouTubeURL']);
          if (typeof data.enabled !== 'undefined') {
            setIsEnabled(data.enabled);
          }
          if (data.currentYouTubeURL) {
            setCurrentVideoURL(data.currentYouTubeURL);
          }
        } catch (error) {
          console.error('Error accessing chrome storage:', error);
        }
      }
    };

    getStorageData();

    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'local') {
        if (changes.enabled) {
          setIsEnabled(changes.enabled.newValue);
        }
        if (changes.currentYouTubeURL) {
          setCurrentVideoURL(changes.currentYouTubeURL.newValue);
        }
      }
    };

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener(handleStorageChange);
    }

    return () => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      }
    };
  }, []);

  const handleChange = async (checked: boolean) => {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
      console.error('Chrome storage is not available');
      return;
    }

    if (!checked) {
      const password = prompt('Please enter your password to disable:');
      if (password === 'Peek-A-Tube') {
        setIsEnabled(false);
        await chrome.storage.local.set({ enabled: false });
      } else {
        alert('Wrong password!');
        return;
      }
    } else {
      setIsEnabled(true);
      await chrome.storage.local.set({ enabled: true });
    }
  };

  return (
    <div className="w-80 p-6 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Peek-a-Tube</h1>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          {isEnabled ? (
            <Lock className="w-5 h-5 text-green-500" />
          ) : (
            <Unlock className="w-5 h-5 text-red-500" />
          )}
          <span className="font-medium">{isEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={handleChange}
        />
      </div>
      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-semibold mb-2 flex items-center">
          <Youtube className="w-5 h-5 mr-2 text-red-500" />
          Current YouTube Video
        </h2>
        <p className="text-sm break-all">
          {currentVideoURL || 'No video currently playing'}
        </p>
      </div>
    </div>
  );
};

export default Popup;
