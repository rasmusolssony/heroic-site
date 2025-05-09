import { Box, Heading, Text } from '@chakra-ui/react';

const Members = () => {
  return (
    <Box
      p={6}
      textAlign="center"
      bg="gray.900"
      color="white"
      minH="calc(100vh - 64px)"
    >
      <Heading mb={4} as="h1" size="4xl">
        Members
      </Heading>
      <Text>Coming soon...</Text>
    </Box>
  );
};

export default Members;
