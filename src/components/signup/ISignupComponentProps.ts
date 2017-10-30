export interface ISignupComponentProps {

  /**
   * Display error
   *
   * @memberof ISignupComponentState
   */
  showError: (message: string) => any

    /**
     * Register user
     *
     * @memberof ISignupComponentState
     */
  register: (data: any) => any

    /**
     * Login
     *
     * @memberof ISignupComponentState
     */
  loginPage: () => any
}
