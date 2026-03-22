import { useState } from 'react'

export function useAuthForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (action: () => Promise<void>) => {
    setError(null)
    setIsSubmitting(true)

    try {
      await action()
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    error,
    isSubmitting,
    submit,
  }
}
