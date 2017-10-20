// - Import react components
import { firebaseRef, firebaseAuth } from 'app/firebase/'

import { SocialError } from 'domain/common'
import { ICircleService } from 'services/circles'
import { Circle, UserFollower } from 'domain/circles'
import { User } from 'domain/users'

/**
 * Firbase circle service
 *
 * @export
 * @class CircleService
 * @implements {ICircleService}
 */
export class CircleService implements ICircleService {

  public addCircle: (userId: string, circle: Circle)
    => Promise<string> = (userId, circle) => {
      return new Promise<string>((resolve,reject) => {
        let circleRef = firebaseRef.child(`userCircles/${userId}/circles`).push(circle)
        circleRef.then(() => {
          resolve(circleRef.key as string)
        })
      .catch((error: any) => {
        reject(new SocialError(error.code, error.message))
      })

      })

    }

  public addFollowingUser: (userId: string, circleId: string, userCircle: User, userFollower: UserFollower, userFollowingId: string)
    => Promise<void> = (userId, circleId, userCircle, userFollower, userFollowingId) => {
      return new Promise<void>((resolve,reject) => {

        let updates: any = {}
        updates[`userCircles/${userId}/circles/${circleId}/users/${userFollowingId}`] = userCircle
        updates[`userCircles/${userFollowingId}/circles/-Followers/users/${userId}`] = userFollower

        firebaseRef.update(updates).then(() => {
          resolve()
        })
      .catch((error: any) => {
        reject(new SocialError(error.code, error.message))
      })

      })
    }
  public deleteFollowingUser: (userId: string, circleId: string, userFollowingId: string)
    => Promise<void> = (userId, circleId, userFollowingId) => {
      return new Promise<void>((resolve,reject) => {

        let updates: any = {}
        updates[`userCircles/${userId}/circles/${circleId}/users/${userFollowingId}`] = null
        updates[`userCircles/${userFollowingId}/circles/-Followers/users/${userId}`] = null

        firebaseRef.update(updates).then(() => {
          resolve()
        })
        .catch((error: any) => {
          reject(new SocialError(error.code, error.message))
        })

      })
    }
  public updateCircle: (userId: string, circleId: string, circle: Circle)
    => Promise<void> = (userId, circleId, circle) => {
      return new Promise<void>((resolve,reject) => {

        let updates: any = {}
        updates[`userCircles/${userId}/circles/${circleId}`] = circle
        firebaseRef.update(updates).then(() => {
          resolve()
        })
        .catch((error: any) => {
          reject(new SocialError(error.code, error.message))
        })

      })
    }

  public deleteCircle: (userId: string, circleId: string)
    => Promise<void> = (userId, circleId) => {
      return new Promise<void>((resolve,reject) => {

        let updates: any = {}
        updates[`userCircles/${userId}/circles/${circleId}`] = null
        firebaseRef.update(updates).then(() => {
          resolve()
        })
        .catch((error: any) => {
          reject(new SocialError(error.code, error.message))
        })

      })
    }
  public getCircles: (userId: string) => Promise<{ [circleId: string]: Circle }> = (userId) => {
    return new Promise<{ [circleId: string]: Circle }>((resolve,reject) => {
      let circlesRef: any = firebaseRef.child(`userCircles/${userId}/circles`)

      circlesRef.once('value').then((snapshot: any) => {
        let circles: any = snapshot.val() || {}
        let parsedCircles: { [circleId: string]: Circle } = {}
        Object.keys(circles).forEach((circleId) => {

          parsedCircles[circleId] = {
            id: circleId,
            ...circles[circleId]
          }
        })
        resolve(parsedCircles)
      })
        .catch((error: any) => {
          reject(new SocialError(error.code, error.message))
        })

    })
  }
}
