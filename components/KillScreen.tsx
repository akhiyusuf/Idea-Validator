import React from 'react';
import { Button } from './Shared';
import { Skull } from 'lucide-react';

export const KillScreen: React.FC<{ onRestart: () => void }> = ({ onRestart }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
            <div className="p-6 bg-red-500/10 rounded-full border border-red-500 mb-6">
                <Skull className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Idea Killed</h1>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
                The data doesn't lie. This idea failed the validation gates. 
                This isn't failure; it's saved time. Move on to the next one.
            </p>
            <Button onClick={onRestart} variant="secondary">
                Start Fresh
            </Button>
        </div>
    );
};