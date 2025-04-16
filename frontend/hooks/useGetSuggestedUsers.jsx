import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSuggestedUsers } from "../redux/authSlice";

const useGetSuggestedUsers = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const res = await axios.get(
          "https://instagram-tk62.onrender.com/api/v1/user/suggested",
          { withCredentials: true }
        );
        if (res.data.success) {
          dispatch(setSuggestedUsers(res.data.suggestedUsers));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchSuggestedUsers();
  }, [dispatch, user?.following]);
};
export default useGetSuggestedUsers;
