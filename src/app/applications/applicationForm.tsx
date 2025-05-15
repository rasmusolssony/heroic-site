'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Stack,
  Button,
  TextInput,
  Group,
  Textarea,
  Loader,
} from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { Notifications, notifications } from '@mantine/notifications';
import axios from 'axios';
import { debounce } from 'lodash';

type FormData = {
  rsn: string;
  discordName: string;
  country: string;
  timeZone: string;
  alts: string;
  reason: string;
  clanHistory: string;
  referral: string;
};

type RsnValidation = {
  isValid: boolean | null;
  isLoading: boolean;
};

const ApplicationForm = () => {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    reset,
    setError,
    clearErrors,
    setValue,
  } = useForm<FormData>({ mode: 'onChange' });
  const [isLoading, setIsLoading] = useState(false);
  const [rsnValidation, setRsnValidation] = useState<RsnValidation>({
    isValid: null,
    isLoading: false,
  });
  const [discordName, setDiscordName] = useState('');

  useEffect(() => {
    // Listen for messages from popup
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) return;
      const { discordId, discordName } = event.data;
      if (discordId && discordName) {
        setValue('discordName', discordName, { shouldValidate: true });
        setDiscordName(discordName);
        localStorage.setItem('discordName', discordName);
        notifications.show({
          title: 'Success',
          message: 'Successfully linked Discord account.',
          color: 'success',
          autoClose: 5000,
          withCloseButton: true,
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setValue]);

  // Initiate Discord OAuth2
  const handleDiscordLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      process.env.NODE_ENV === 'production'
        ? 'http://heroic-site.s3-website-us-east-1.amazonaws.com/applications/callback'
        : 'localhost:3000/applications/callback'
    );
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify`;
    window.open(authUrl, 'discordLogin', 'width=600, height=800, popup=true');
    console.log('Redirect Uri: ', redirectUri);
  };

  // Clear Discord ID from localStorage
  const handleClearDiscord = () => {
    setValue('discordName', '');
    setDiscordName('');
    localStorage.setItem('discordName', '');
    notifications.show({
      title: 'Discord Cleared',
      message: 'Discord account unlinked.',
      color: 'info',
      autoClose: 5000,
      withCloseButton: true,
    });
  };

  // Debounced RSN validation
  const validateRsn = useCallback(
    debounce(async (username, setError, clearErrors) => {
      if (!username || username.length < 1 || username.length > 12) {
        setRsnValidation({ isValid: null, isLoading: false });
        clearErrors('rsn');
        return;
      }

      setRsnValidation({ isValid: null, isLoading: true });
      try {
        await axios.get(
          `https://api.wiseoldman.net/v2/players/${encodeURIComponent(username)}`
        );
        setRsnValidation({ isValid: true, isLoading: false });
      } catch (error) {
        setRsnValidation({ isValid: false, isLoading: false });
        if (
          axios.isAxiosError(error) &&
          error.response &&
          error.response.status === 404
        ) {
          setError('rsn', {
            type: 'manual',
            message: 'Can’t find OSRS name on Wise Old Man',
          });
        } else {
          setError('rsn', {
            type: 'manual',
            message: 'Error checking OSRS name. Please try again.',
          });
        }
      }
    }, 500),
    []
  );

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        'https://xkfg3vfoyj.execute-api.us-east-1.amazonaws.com/prod/submit-application',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Submission failed');
      }
      notifications.show({
        title: 'Application Submitted',
        message:
          "Thank you for applying! We'll review your application as soon as possible.",
        color: 'green',
        autoClose: 5000,
        withCloseButton: true,
      });
      setDiscordName('');
      localStorage.setItem('discordName', '');
      reset();
    } catch (error) {
      console.log(error);
      notifications.show({
        title: 'Error',
        message: 'Failed to submit application. Please try again later.',
        color: 'red',
        autoClose: 5000,
        withCloseButton: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="md">
        <TextInput
          label="OSRS Name"
          placeholder="OSRS Name"
          withAsterisk
          error={errors.rsn?.message}
          rightSection={
            rsnValidation.isLoading ? (
              <Loader size="sm" />
            ) : rsnValidation.isValid ? (
              <IconCheck size={20} color="teal" />
            ) : rsnValidation.isValid === false ? (
              <IconX size={20} color="red" />
            ) : null
          }
          {...register('rsn', {
            required: 'OSRS Name is Required',
            pattern: {
              value: /^[a-zA-Z0-9\s-]{1,12}$/,
              message: 'RSN must be 1-12 characters, alphanumeric',
            },
            onChange: (e) => validateRsn(e.target.value, setError, clearErrors),
          })}
        />
        <div>
          <TextInput
            label="Discord ID"
            placeholder="Login with Discord"
            withAsterisk
            error={errors.discordName?.message}
            value={discordName}
            disabled
            {...register('discordName', {
              required: 'Discord is required so we can contact you',
            })}
          />
          <Group mt="sm">
            {!discordName ? (
              <Button color="blue" onClick={handleDiscordLogin}>
                Login with Discord
              </Button>
            ) : (
              <Button
                color="red"
                variant="outline"
                onClick={handleClearDiscord}
              >
                Clear Discord
              </Button>
            )}
          </Group>
        </div>
        <TextInput
          label="Country"
          placeholder="Country"
          withAsterisk
          error={errors.country?.message}
          {...register('country', {
            required: 'Country is Required',
          })}
        />
        <TextInput
          label="Time Zone"
          placeholder="Time Zone"
          withAsterisk
          error={errors.timeZone?.message}
          {...register('timeZone', {
            required: 'Time Zone is Required',
          })}
        />
        <Textarea
          label="Alt Accounts"
          placeholder="Alt Accounts"
          error={errors.alts?.message}
          description="Tell us about your alts if you want!"
          {...register('alts')}
        />
        <Textarea
          label="Reason for applying"
          placeholder="Reason"
          withAsterisk
          error={errors.reason?.message}
          description="Tell us about why you are applying to the clan"
          {...register('reason', {
            required: 'You need to provide a reason',
          })}
        />
        <Textarea
          label="Previous Clans & Reason for Leaving"
          placeholder="Clan History"
          error={errors.clanHistory?.message}
          description="Please let us know if you have been a member of any other clans and why you left"
          {...register('clanHistory')}
        />
        <TextInput
          label="How did you hear about the clan?"
          placeholder="Referral"
          withAsterisk
          error={errors.referral?.message}
          description="If referred by a member please state username"
          {...register('referral', {
            required: 'Please let us know how you found us!',
          })}
        />
        <Button
          mt="md"
          color="teal"
          loading={isSubmitting || isLoading}
          disabled={isSubmitting || isLoading || !rsnValidation.isValid}
          type="submit"
        >
          Submit
        </Button>
      </Stack>
      <Notifications />
    </form>
  );
};

export default ApplicationForm;
