import { Box, Heading, Text } from '@chakra-ui/react';

const Announcements = () => {
  return (
    <Box
      p={6}
      textAlign="center"
      bg="gray.900"
      color="white"
      minH="calc(100vh - 64px)"
    >
      <Heading as="h1" size="4xl">
        Announcements
      </Heading>
      <Text>Coming soon...</Text>
    </Box>
  );
};
export default Announcements;
