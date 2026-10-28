export interface GeoCoordinates {
  latitude: number
  longitude: number
  accuracy: number
}

// Sign-in/out actions require location services to be on. Rejects with a
// friendly message for every failure mode (unsupported device, permission
// denied, unavailable position, timeout) so callers can surface it directly.
export function captureLocation(): Promise<GeoCoordinates> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Location services aren't available on this device."))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }),
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(
              new Error("Turn on location access to sign in or out.")
            )
            break
          case error.POSITION_UNAVAILABLE:
            reject(
              new Error(
                "Couldn't determine your location. Make sure location services are turned on."
              )
            )
            break
          default:
            reject(new Error("Timed out getting your location. Try again."))
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  })
}
