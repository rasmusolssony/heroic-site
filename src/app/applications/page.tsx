import { Box, Heading } from '@chakra-ui/react';

import ApplicationForm from './applicationForm';

const Applications = () => {
  return (
    <Box
      p={6}
      textAlign="center"
      bg="gray.900"
      color="white"
      minH="calc(100vh - 64px)"
    >
      <Heading mb={4} as="h1" size="4xl">
        Applications
      </Heading>
      <Box maxW="600px" mx="auto" p={6} textAlign="left">
        <ApplicationForm />
      </Box>
    </Box>
  );
};

export default Applications;
