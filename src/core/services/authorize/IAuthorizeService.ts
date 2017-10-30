import { User } from 'core/domain/users'
import { LoginUser, RegisterUserResult } from 'core/domain/authorize'

/**
 * Authentication service interface
 *
 * @export
 * @interface IAuthorizeService
 */
export interface IAuthorizeService {

    /**
     * Login the user
     *
     * @returns {Promise<void>}
     * @memberof IAuthorizeService
     */
  login: (email: string, password: string) => Promise<LoginUser>

   /**
    * Logs out the user
    *
    * @returns {Promise<void>}
    * @memberof IAuthorizeService
    */
  logout: () => Promise<void>

    /**
     * @returns {Promise<void>}
     */
  updatePassword: (newPassword: string) => Promise<void>

    /**
     * @returns {Promise<void>}
     */
  registerUser: (user: User) => Promise<RegisterUserResult>

}