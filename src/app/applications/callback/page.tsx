'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@chakra-ui/react';
import axios from 'axios';

const DiscordCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      toast({
        title: 'Error',
        description: 'No authorization code provided.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      window.close();
      return;
    }

    const exchangeCode = async () => {
      try {
        const callbackUrl =
          'https://xkfg3vfoyj.execute-api.us-east-1.amazonaws.com/prod/discord/callback';
        const response = await axios.post(callbackUrl, { code });
        const { discordId, username } = JSON.parse(response.data.body);

        // Send data to parent window
        window.opener.postMessage(
          { discordId, discordName: username },
          window.location.origin
        );
        window.close();
        toast({
          title: 'Success',
          description: 'Successfully linked Discord account.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        window.close();
      } catch (error) {
        console.error('Error: ', error);
        toast({
          title: 'Error',
          description: 'Failed to link Discord account. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        window.close();
      }
    };

    exchangeCode();
  }, [searchParams, router, toast]);

  return <div>Processing Discord authentication...</div>;
};

export default DiscordCallback;
