// - Import react components
import { Action } from 'redux'

// - Import domain
import { Post } from 'core/domain/posts'
import { Comment } from 'core/domain/comments'
import { SocialError } from 'core/domain/common'

// - Import utility components
import moment from 'moment'

// - Import action types
import { PostActionType } from 'constants/postActionType'

// - Import actions
import * as globalActions from 'actions/globalActions'

import { IPostService } from 'core/services/posts'
import { SocialProviderTypes } from 'core/socialProviderTypes'
import { provider } from '../socialEngine'

/**
 * Get service providers
 */
const postService: IPostService = provider.get<IPostService>(SocialProviderTypes.PostService)

/* _____________ CRUD DB _____________ */

/**
 * Add a normal post
 * @param {any} newPost
 * @param {Function} callBack
 */
export let dbAddPost = (newPost: Post, callBack: Function) => {
  return (dispatch: any, getState: Function) => {

    let uid: string = getState().authorize.uid
    let post: Post = {
      postTypeId: 0,
      creationDate: moment().unix(),
      deleteDate: 0,
      score: 0,
      viewCount: 0,
      body: newPost.body,
      ownerUserId: uid,
      ownerDisplayName: newPost.ownerDisplayName,
      ownerAvatar: newPost.ownerAvatar,
      lastEditDate: 0,
      tags: newPost.tags || [],
      commentCounter: 0,
      comments: {},
      votes: {},
      image: '',
      imageFullPath: '',
      video: '',
      disableComments: newPost.disableComments,
      disableSharing: newPost.disableSharing,
      deleted: false
    }

    return postService.addPost(post).then((postKey: string) => {
      dispatch(addPost(uid, {
        ...post,
        id: postKey
      }))
      callBack()
    })
      .catch((error: SocialError) => dispatch(globalActions.showErrorMessage(error.message)))
  }
}

/**
 * Add a post with image
 * @param {object} newPost
 * @param {function} callBack
 */
export const dbAddImagePost = (newPost: Post, callBack: Function) => {
  return (dispatch: any, getState: Function) => {

    dispatch(globalActions.showTopLoading())

    let uid: string = getState().authorize.uid
    let post: Post = {
      postTypeId: 1,
      creationDate: moment().unix(),
      deleteDate: 0,
      score: 0,
      viewCount: 0,
      body: newPost.body,
      ownerUserId: uid,
      ownerDisplayName: newPost.ownerDisplayName,
      ownerAvatar: newPost.ownerAvatar,
      lastEditDate: 0,
      tags: newPost.tags || [],
      commentCounter: 0,
      image: newPost.image || '',
      imageFullPath: newPost.imageFullPath || '',
      video: '',
      disableComments: newPost.disableComments ? newPost.disableComments : false,
      disableSharing: newPost.disableSharing ? newPost.disableSharing : false,
      deleted: false
    }

    return postService.addPost(post).then((postKey: string) => {
      dispatch(addPost(uid, {
        ...post,
        id: postKey
      }))
      callBack()
      dispatch(globalActions.hideTopLoading())

    })
      .catch((error: SocialError) => dispatch(globalActions.showErrorMessage(error.message)))

  }

}

/**
 * Update a post from database
 * @param  {object} newPost
 * @param {func} callBack //TODO: anti pattern should change to parent state or move state to redux
 */
export const dbUpdatePost = (updatedPost: Post, callBack: Function) => {
  return (dispatch: any, getState: Function) => {

    dispatch(globalActions.showTopLoading())
    // Get current user id
    let uid: string = getState().authorize.uid

    return postService.updatePost(updatedPost).then(() => {

      dispatch(updatePost(updatedPost))
      callBack()
      dispatch(globalActions.hideTopLoading())

    })
      .catch((error: SocialError) => {
        dispatch(globalActions.showErrorMessage(error.message))
        dispatch(globalActions.hideTopLoading())

      })
  }

}

/**
 * Delete a post from database
 * @param  {string} id is post identifier
 */
export const dbDeletePost = (id: string) => {
  return (dispatch: any, getState: Function) => {

    dispatch(globalActions.showTopLoading())

    // Get current user id
    let uid: string = getState().authorize.uid

    return postService.deletePost(id).then(() => {
      dispatch(deletePost(uid, id))
      dispatch(globalActions.hideTopLoading())

    })
      .catch((error: SocialError) => {
        dispatch(globalActions.showErrorMessage(error.message))
        dispatch(globalActions.hideTopLoading())
      })
  }

}

/**
 * Get all user posts from data base
 */
export const dbGetPosts = (page: number = 0, limit: number = 10) => {
  return (dispatch: any, getState: Function) => {
    const state = getState()
    const {stream} = state.post
    const lastPageRequest = stream.lastPageRequest
    const lastPostId = stream.lastPostId
    const hasMoreData = stream.hasMoreData

    let uid: string = state.authorize.uid
    if (uid && lastPageRequest !== page) {
      return postService.getPosts(uid, lastPostId, page, limit).then((result) => {
        if (!result.posts || !(result.posts.length > 0)) {
          return dispatch(notMoreDataStream())
        }

        // Store last post Id
        dispatch(lastPostStream(result.newLastPostId))

        let parsedData: { [userId: string]: {[postId: string]: Post} } = {}
        result.posts.forEach((post) => {
          const postId = Object.keys(post)[0]
          const postData = post[postId]
          const ownerId = postData.ownerUserId!
          parsedData = {
            ...parsedData,
            [ownerId]: {
              ...parsedData[ownerId],
              [postId]: {
                ...postData
              }
            }
          }
        })
        dispatch(addPosts(parsedData))
      })
        .catch((error: SocialError) => {
          dispatch(globalActions.showErrorMessage(error.message))
        })

    }
  }
}

/**
 * Get all user posts from data base
 */
export const dbGetPostsByUserId = (page: number = 0, limit: number = 10) => {
  return (dispatch: any, getState: Function) => {
    const state = getState()
    const {profile} = state.post
    const lastPageRequest = profile.lastPageRequest
    const lastPostId = profile.lastPostId
    const hasMoreData = profile.hasMoreData

    let uid: string = state.authorize.uid

    if (uid && lastPageRequest !== page) {

      return postService.getPostsByUserId(uid, lastPostId, page, limit).then((result) => {

        if (!result.posts || !(result.posts.length > 0)) {
          return dispatch(notMoreDataProfile())
        }
        // Store last post Id
        dispatch(lastPostProfile(result.newLastPostId))

        let parsedData: { [userId: string]: {[postId: string]: Post} } = {}
        result.posts.forEach((post) => {
          const postId = Object.keys(post)[0]
          const postData = post[postId]
          const ownerId = postData.ownerUserId!
          parsedData = {
            ...parsedData,
            [ownerId]: {
              ...parsedData[ownerId],
              [postId]: {
                ...postData
              }
            }
          }
        })
        dispatch(addPosts(parsedData))
      })
        .catch((error: SocialError) => {
          dispatch(globalActions.showErrorMessage(error.message))
        })

    }
  }
}

/**
 * Get all user posts from data base
 * @param uid post owner identifier
 * @param postId post identifier
 */
export const dbGetPostById = (uid: string, postId: string) => {
  return (dispatch: any, getState: Function) => {
    if (uid) {

      return postService.getPostById(postId).then((post: Post) => {
        dispatch(addPost(uid, post))
      })
        .catch((error: SocialError) => {
          dispatch(globalActions.showErrorMessage(error.message))
        })

    }
  }
}

/* _____________ CRUD State _____________ */

/**
 * Add a normal post
 * @param {string} uid is user identifier
 * @param {Post} post
 */
export const addPost = (uid: string, post: Post) => {
  return {
    type: PostActionType.ADD_POST,
    payload: { uid, post }
  }
}

/**
 * Update a post
 * @param {string} uid is user identifier
 * @param {Post} post
 */
export const updatePost = (post: Post) => {
  return {
    type: PostActionType.UPDATE_POST,
    payload: { post }
  }
}

/**
 * Delete a post
 * @param {string} uid is user identifier
 * @param {string} id is post identifier
 */
export const deletePost = (uid: string, id: string) => {
  return {
    type: PostActionType.DELETE_POST,
    payload: { uid, id }
  }
}

/**
 * Add a list of post
 * @param {string} uid
 * @param {[object]} posts
 */
export const addPosts = (userPosts: { [userId: string]: {[postId: string]: Post} }) => {
  return {
    type: PostActionType.ADD_LIST_POST,
    payload: { userPosts }
  }
}

/**
 * Clea all data in post store
 */
export const clearAllData = () => {
  return {
    type: PostActionType.CLEAR_ALL_DATA_POST
  }
}

/**
 * Add a post with image
 */
export const addImagePost = (uid: string, post: any) => {
  return {
    type: PostActionType.ADD_IMAGE_POST,
    payload: { uid, post }
  }

}

/**
 * Set stream has more data to show
 */
export const hasMoreDataStream = () => {
  return {
    type: PostActionType.HAS_MORE_DATA_STREAM
  }

}

/**
 * Set stream has not data any more to show
 */
export const notMoreDataStream = () => {
  return {
    type: PostActionType.NOT_MORE_DATA_STREAM
  }

}

/**
 * Set last page request of stream
 */
export const requestPageStream = (page: number) => {
  return {
    type: PostActionType.REQUEST_PAGE_STREAM,
    payload: { page}
  }

}

/**
 * Set last post identification of stream
 */
export const lastPostStream = (lastPostId: string) => {
  return {
    type: PostActionType.LAST_POST_STREAM,
    payload: { lastPostId}
  }

}


/**
 * Set profile posts has more data to show
 */
export const hasMoreDataProfile = () => {
  return {
    type: PostActionType.HAS_MORE_DATA_PROFILE
  }

}

/**
 * Set profile posts has not data any more to show
 */
export const notMoreDataProfile = () => {
  return {
    type: PostActionType.NOT_MORE_DATA_PROFILE
  }

}

/**
 * Set last page request of profile posts
 */
export const requestPageProfile = (page: number) => {
  return {
    type: PostActionType.REQUEST_PAGE_PROFILE,
    payload: { page}
  }

}

/**
 * Set last post identification of profile posts
 */
export const lastPostProfile = (lastPostId: string) => {
  return {
    type: PostActionType.LAST_POST_PROFILE,
    payload: { lastPostId}
  }

}