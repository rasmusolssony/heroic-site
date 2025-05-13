'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Notifications, notifications } from '@mantine/notifications';
import axios from 'axios';

const DiscordCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      notifications.show({
        title: 'Error',
        message: 'No authorization code provided.',
        color: 'red',
        autoClose: 5000,
        withCloseButton: true,
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
        notifications.show({
          title: 'Success',
          message: 'Successfully linked Discord account.',
          color: 'green',
          autoClose: 5000,
          withCloseButton: true,
        });
        window.close();
      } catch (error) {
        console.error('Error: ', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to link Discord account. Please try again.',
          color: 'red',
          autoClose: 5000,
          withCloseButton: true,
        });
        window.close();
      }
    };

    exchangeCode();
  }, [searchParams, router]);

  return <Notifications />;
};

export default DiscordCallback;
