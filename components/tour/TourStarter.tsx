'use client'

import { useEffect } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { tourSteps, TOUR_STORAGE_KEY } from '@/lib/tour'

export default function TourStarter() {
  useEffect(() => {
    if (localStorage.getItem(TOUR_STORAGE_KEY)) return

    const driverObj = driver({
      allowClose: true,
      showProgress: true,
      steps: tourSteps,
      onDestroyStarted: () => {
        localStorage.setItem(TOUR_STORAGE_KEY, '1')
        driverObj.destroy()
      },
    })

    driverObj.drive()
  }, [])

  return null
}
