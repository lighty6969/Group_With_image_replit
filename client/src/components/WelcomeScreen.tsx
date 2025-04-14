import React from 'react';
import RoomForm from './RoomForm';

interface WelcomeScreenProps {
  onJoinRoom: (roomId: string, username?: string) => void;
  isJoining: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onJoinRoom,
  isJoining
}) => {
  return (
    <div className="flex flex-col h-full">
      <header className="bg-primary text-white py-4 px-6 shadow-md">
        <h1 className="text-2xl font-medium">TextRoom</h1>
        <p className="text-sm opacity-80">Real-time text chat rooms</p>
      </header>
      
      <div className="flex flex-col items-center justify-center flex-grow p-6 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-medium text-center mb-6 dark:text-gray-100">Join or Create a Room</h2>
          
          <RoomForm 
            onSubmit={onJoinRoom} 
            isSubmitting={isJoining}
          />
          
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">How It Works</h3>
            <div className="grid grid-cols-1 gap-4 text-center text-sm">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md dark:text-gray-200">
                <span className="material-icons text-primary mb-1">meeting_room</span>
                <p>Create or join a room with any ID</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md dark:text-gray-200">
                <span className="material-icons text-primary mb-1">chat</span>
                <p>Chat in real-time with others in the room</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md dark:text-gray-200">
                <span className="material-icons text-primary mb-1">delete_sweep</span>
                <p>Messages disappear when everyone leaves</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-white dark:bg-gray-800 py-3 px-6 text-center text-xs text-gray-500 dark:text-gray-400 border-t dark:border-gray-700">
        <p>No login required. No message storage. Simple text chat.</p>
      </footer>
    </div>
  );
};

export default WelcomeScreen;
