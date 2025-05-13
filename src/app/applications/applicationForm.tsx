'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  VStack,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
  InputRightElement,
  Textarea,
  FormHelperText,
  useToast,
  Spinner,
  Icon,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
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
  const toast = useToast();
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
        toast({
          title: 'Success',
          description: 'Successfully linked Discord account.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setValue, toast]);

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
  };

  // Clear Discord ID from localStorage
  const handleClearDiscord = () => {
    setValue('discordName', '');
    setDiscordName('');
    localStorage.setItem('discordName', '');
    toast({
      title: 'Discord Cleared',
      description: 'Discord account unlinked.',
      status: 'info',
      duration: 5000,
      isClosable: true,
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
      toast({
        title: 'Application Submitted',
        description:
          "Thank you for applying! We'll review your application as soon as possible.",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setDiscordName('');
      localStorage.setItem('discordName', '');
      reset();
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error',
        description: 'Failed to submit application. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={4}>
        <FormControl isInvalid={!!errors.rsn}>
          <FormLabel htmlFor="rsn">OSRS Name</FormLabel>
          <InputGroup>
            <Input
              id="rsn"
              placeholder="OSRS Name"
              {...register('rsn', {
                required: 'OSRS Name is Required',
                pattern: {
                  value: /^[a-zA-Z0-9\s-]{1,12}$/,
                  message: 'RSN must be 1-12 characters, alphanumeric',
                },
                onChange: (e) =>
                  validateRsn(e.target.value, setError, clearErrors),
              })}
            />
            <InputRightElement>
              {rsnValidation.isLoading ? (
                <Spinner size="sm" mt={2} />
              ) : rsnValidation.isValid ? (
                <Icon as={CheckIcon} color="teal.500" />
              ) : rsnValidation.isValid === false ? (
                <Icon as={CloseIcon} color="red.500" />
              ) : null}
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage>
            {errors.rsn && errors.rsn?.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.discordName}>
          <FormLabel htmlFor="discordName">Discord ID</FormLabel>
          <Input
            id="discordName"
            placeholder="Login with Discord"
            {...register('discordName', {
              required: 'Discord is required so we can contact you',
            })}
            value={discordName}
            isDisabled={true}
          />
          {!discordName ? (
            <Button mt={2} colorScheme="blue" onClick={handleDiscordLogin}>
              Login with Discord
            </Button>
          ) : (
            <Button
              mt={2}
              colorScheme="red"
              variant="outline"
              onClick={handleClearDiscord}
            >
              Clear Discord
            </Button>
          )}
          <FormErrorMessage>
            {errors.discordName && errors.discordName?.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.country}>
          <FormLabel htmlFor="country">Country</FormLabel>
          <Input
            id="country"
            placeholder="Country"
            {...register('country', {
              required: 'Country is Required',
            })}
          />
          <FormErrorMessage>
            {errors.country && errors.country?.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.timeZone}>
          <FormLabel htmlFor="timeZone">Time Zone</FormLabel>
          <Input
            id="timeZone"
            placeholder="Time Zone"
            {...register('timeZone', {
              required: 'Time Zone is Required',
            })}
          />
          <FormErrorMessage>
            {errors.timeZone && errors.timeZone?.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.alts}>
          <FormLabel htmlFor="alts">Alt Accounts</FormLabel>
          <Textarea
            id="alts"
            placeholder="Alt Accounts"
            {...register('alts')}
          />
          <FormHelperText>Tell us about your alts if you want!</FormHelperText>
          <FormErrorMessage>
            {errors.alts && errors.alts?.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.reason}>
          <FormLabel htmlFor="reason">Reason for applying</FormLabel>
          <Textarea
            id="reason"
            placeholder="Reason"
            {...register('reason', {
              required: 'You need to provide a reason',
            })}
          />
          <FormHelperText>
            Tell us about why you are applying to the clan
          </FormHelperText>
          <FormErrorMessage>
            {errors.reason && errors.reason?.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.clanHistory}>
          <FormLabel htmlFor="clanHistory">
            Previous Clans & Reason for Leaving
          </FormLabel>
          <Textarea
            id="clanHistory"
            placeholder="Clan History"
            {...register('clanHistory')}
          />
          <FormHelperText>
            Please let us know if you have been a member of any other clans and
            why you left
          </FormHelperText>
          <FormErrorMessage>
            {errors.clanHistory && errors.clanHistory?.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.referral}>
          <FormLabel htmlFor="referral">
            How did you hear about the clan?
          </FormLabel>
          <Input
            id="referral"
            placeholder="Referral"
            {...register('referral', {
              required: 'Please let us know how you found us!',
            })}
          />
          <FormHelperText>
            If referred by a member please state username
          </FormHelperText>
          <FormErrorMessage>
            {errors.referral && errors.referral?.message}
          </FormErrorMessage>
        </FormControl>
        <Button
          mt={4}
          colorScheme="teal"
          isLoading={isSubmitting || isLoading}
          isDisabled={isSubmitting || isLoading || !rsnValidation.isValid}
          type="submit"
        >
          Submit
        </Button>
      </VStack>
    </form>
  );
};

export default ApplicationForm;
