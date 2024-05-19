import httpRequest from "../config/http";

const userService = {
  getAllUsers: async () => {
    const result = await httpRequest.get("/users");
    return result;
  },
  getUserById: async (id) => {
    const result = await httpRequest.get(`/users/${id}`);
    return result;
  },
  updateUserById: async (id, data) => {
    const result = await httpRequest.put(`/users/${id}`, data);
    return result;
  },
  getUsersBySearchTerms: async (searchTerm) => {
    const result = await httpRequest.get(
      `/users/search/s?searchTerm=${searchTerm}`
    );
    return result;
  },
  changePassword: async (id, { oldPassword, newPassword }) => {
    const result = await httpRequest.put(`/users/change-password/${id}`, {
      oldPassword,
      newPassword,
    });
    return result;
  },
  sendFriendRequest: async ({ senderId, receiverId }) => {
    const result = await httpRequest.post(`/users/sendFriendRequest`, {
      senderId,
      receiverId,
    });
    return result;
  },
  acceptFriendRequest: async ({ userId, requesterId }) => {
    const result = await httpRequest.post(`/users/acceptFriendRequest`, {
      userId,
      requesterId,
    });
    return result;
  },
  getFriendList: async (userId) => {
    const result = await httpRequest.get(`/users/getFriendList/${userId}`);
    return result;
  },
  getFriendRequestList: async (userId) => {
    const result = await httpRequest.get(
      `/users/getFriendRequestList/${userId}`
    );
    return result;
  },
  getFriendRequestsReceived: async (userId) => {
    const result = await httpRequest.get(
      `/users/getFriendRequestsReceived/${userId}`
    );
    return result;
  },
  rejectedFriendRequest: async ({ userId, requesterId }) => {
    const result = await httpRequest.post(`/users/rejectedFriendRequest`, {
      userId,
      requesterId,
    });
    return result;
  },
  unfriend: async ({ userId, friendId }) => {
    const result = await httpRequest.post(`/users/unfriend`, {
      userId,
      friendId,
    });
    return result;
  },
};

export default userService;
