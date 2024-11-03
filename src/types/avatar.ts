import { AvatarProps as RadixAvatarProps } from "@radix-ui/react-avatar"

export interface AvatarProps extends RadixAvatarProps {
  src?: string
  alt?: string
  fallback?: string
  status?: 'online' | 'offline' | 'busy' | 'away'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export interface AvatarGroupProps {
  children: React.ReactNode
  max?: number
  className?: string
}
