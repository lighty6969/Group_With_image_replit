import React, { useState, useEffect } from 'react';
import { generateRandomUsername } from '@/utils/nameGenerator';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const formSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
  username: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

interface RoomFormProps {
  onSubmit: (roomId: string, username?: string) => void;
  isSubmitting?: boolean;
}

const RoomForm: React.FC<RoomFormProps> = ({ onSubmit, isSubmitting = false }) => {
  const [randomUsername, setRandomUsername] = useState<string>('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomId: '',
      username: ''
    }
  });

  useEffect(() => {
    // Generate random username on mount
    generateRandomName();
  }, []);

  const generateRandomName = () => {
    const newRandomName = generateRandomUsername();
    setRandomUsername(newRandomName);
  };

  const handleSubmit = (data: FormData) => {
    const finalUsername = data.username?.trim() || randomUsername;
    onSubmit(data.roomId, finalUsername);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="roomId"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Room ID</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Enter a room ID" 
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </FormControl>
              <p className="text-xs text-gray-500 dark:text-gray-400">Enter an existing room ID or create a new one</p>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Name (Optional)</FormLabel>
              <div className="flex space-x-2">
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Leave empty for random name" 
                    className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </FormControl>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={generateRandomName}
                  className="p-2 text-primary hover:bg-primary hover:bg-opacity-10 dark:hover:bg-opacity-20 rounded-md"
                  title="Generate random name"
                >
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Random name: <span className="font-medium dark:text-gray-300">{randomUsername}</span>
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full py-3 px-4 bg-primary text-white rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Joining...' : 'Join Room'}
        </Button>
      </form>
    </Form>
  );
};

export default RoomForm;
