'use client';

import {
  Box,
  Flex,
  Link,
  HStack,
  IconButton,
  useDisclosure,
  Stack,
} from '@chakra-ui/react';
import { RxHamburgerMenu } from 'react-icons/rx';
import { IoMdClose } from 'react-icons/io';

const Links = [
  { name: 'Home', href: '/' },
  { name: 'Announcements', href: '/announcements/' },
  { name: 'Applications', href: '/applications/' },
  { name: 'Members', href: '/members/' },
];

const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <Link
    px={2}
    py={1}
    rounded="md"
    _hover={{ textDecoration: 'none', bg: 'gray.200' }}
    href={href}
  >
    {children}
  </Link>
);

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box bg="blackAlpha.100" px={4}>
      <Flex h={16} alignItems="center" justifyContent="space-between">
        {/* Mobile Menu Button */}
        <IconButton
          size="md"
          aria-label="Open Menu"
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        >
          {isOpen ? <IoMdClose /> : <RxHamburgerMenu />}
        </IconButton>

        <HStack alignItems="center">
          {/* Logo/Brand Name */}
          <Box fontWeight="bold">Heroic Clan</Box>
          <HStack as="nav" display={{ base: 'none', md: 'flex' }}>
            {Links.map((link) => (
              <NavLink key={link.name} href={link.href}>
                {link.name}
              </NavLink>
            ))}
          </HStack>
        </HStack>

        <Flex alignItems="center">
          {/* Place for additional actions like user profile */}
        </Flex>
      </Flex>

      {/* Mobile Menu */}
      {isOpen && (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as="nav">
            {Links.map((link) => (
              <NavLink key={link.name} href={link.href}>
                {link.name}
              </NavLink>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default Navbar;
