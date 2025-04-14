import React from 'react';
import { RoomUser } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Copy, X, Info, Clock, Trash, LockOpen } from 'lucide-react';

interface RoomInfoProps {
  roomId: string;
  users: RoomUser[];
  username: string;
  visible: boolean;
  onClose: () => void;
  onCopyRoomId: () => void;
  creationTime: string;
  isMobile: boolean;
}

const RoomInfo: React.FC<RoomInfoProps> = ({
  roomId,
  users,
  username,
  visible,
  onClose,
  onCopyRoomId,
  creationTime,
  isMobile
}) => {
  if (!visible) {
    return null;
  }

  const infoClasses = isMobile 
    ? "fixed inset-0 z-50 bg-white overflow-y-auto p-4" 
    : "hidden lg:block lg:w-80 border-l border-gray-200 bg-white overflow-y-auto";

  return (
    <div className={infoClasses}>
      {isMobile && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Room Information</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
      
      {!isMobile && (
        <div className="p-4">
          <h2 className="text-lg font-medium mb-4">Room Information</h2>
        </div>
      )}
      
      <div className="p-4 pt-0">
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Room ID</h3>
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
            <span className="text-sm font-mono">{roomId}</span>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-primary hover:bg-primary hover:bg-opacity-10 p-1 rounded"
              onClick={onCopyRoomId}
              title="Copy room ID"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Share this ID with others to invite them</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">People in Room ({users.length})</h3>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {users.map(user => (
              <li key={user.socketId} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                <span className="text-sm">
                  <span className="font-medium">{user.username}</span>
                  {user.username === username && (
                    <span className="text-xs text-primary ml-1">(you)</span>
                  )}
                </span>
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">About This Room</h3>
          <ul className="space-y-2 text-xs text-gray-600">
            <li className="flex items-start">
              <Clock className="text-gray-400 mr-2 h-4 w-4" />
              <span>Created {creationTime}</span>
            </li>
            <li className="flex items-start">
              <Trash className="text-gray-400 mr-2 h-4 w-4" />
              <span>Messages will be deleted when everyone leaves</span>
            </li>
            <li className="flex items-start">
              <LockOpen className="text-gray-400 mr-2 h-4 w-4" />
              <span>Anyone with the room ID can join</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RoomInfo;
