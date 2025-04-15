import axios from "axios";
import { setAuthUser, setSuggestedUsers } from "../../redux/authSlice";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";

const useFollowUnfollow = () => {
  const dispatch = useDispatch();
  const { user, suggestedUsers } = useSelector((store) => store.auth);

  const followUnfollowHandler = async (userId) => {
    try {
      const res = await axios.post(
        `http://localhost:4000/api/v1/user/followorunfollow/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        const isFollowing = user.following.includes(userId);

        // Update the authenticated user
        const updatedAuthUser = {
          ...user,
          following: isFollowing
            ? user.following.filter((id) => id !== userId)
            : [...user.following, userId],
        };
        dispatch(setAuthUser(updatedAuthUser));

        // Update the suggested users list
        const updatedSuggestedUsers = suggestedUsers.filter(
          (user) => user._id !== userId
        );
        dispatch(setSuggestedUsers(updatedSuggestedUsers));

        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return { followUnfollowHandler };
};

export default useFollowUnfollow;
