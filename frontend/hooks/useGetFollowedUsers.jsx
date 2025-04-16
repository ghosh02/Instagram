import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFollowedUsers } from "../redux/authSlice";

const useGetFollowedUsers = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const res = await axios.get(
          "https://instagram-tk62.onrender.com/api/v1/user/followed",
          { withCredentials: true }
        );
        if (res.data.success) {
          dispatch(setFollowedUsers(res.data.followedUsers));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchSuggestedUsers();
  }, [dispatch, user?.following]);
};
export default useGetFollowedUsers;
