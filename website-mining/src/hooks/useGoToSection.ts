import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { scrollToSection } from './useSmoothScroll'

/**
 * Scroll to a home-page section — travelling back to `/` first when the
 * user is on a catalog route. Home picks the target up from location state.
 */
export function useGoToSection() {
  const location = useLocation()
  const navigate = useNavigate()

  return useCallback(
    (id: string, delay = 0) => {
      if (location.pathname === '/') {
        setTimeout(() => scrollToSection(id), delay)
      } else {
        navigate('/', { state: { section: id } })
      }
    },
    [location.pathname, navigate],
  )
}
