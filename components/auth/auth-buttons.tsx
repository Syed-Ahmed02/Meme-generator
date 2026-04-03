"use client"

import { Show, SignInButton, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export function AuthButtons() {
  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <Button variant="outline" size="sm">
            Sign in
          </Button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </>
  )
}
