import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useFollowUnfollow from "../lib/useFollowUnfollow";

const SuggestedUsers = () => {
  const { suggestedUsers, user: authUser } = useSelector((store) => store.auth);
  const { followUnfollowHandler } = useFollowUnfollow();
  // console.log(suggestedUsers);

  return (
    <div className="my-10">
      {suggestedUsers.length > 0 ? (
        <div className="flex items-center justify-between text-sm gap-2">
          <h1 className="font-semibold text-gray-600">Suggested for you</h1>
          <span className="font-medium cursor-pointer">See All</span>
        </div>
      ) : (
        <h1 className="font-semibold text-gray-600">No suggested for you</h1>
      )}
      {suggestedUsers.map((user) => {
        const isFollowing = authUser?.following.includes(user._id);
        return (
          <div
            key={user._id}
            className="flex items-center justify-between my-5 gap-2.5"
          >
            <div className="flex items-center gap-3">
              <Link to={`/profile/${user?._id}`}>
                <Avatar>
                  <AvatarImage src={user?.profilePicture} alt="post_image" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Link>
              <div className="truncate w-40 overflow-hidden whitespace-nowrap">
                <h1 className="font-semibold text-sm ">
                  <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
                </h1>
                <span className="text-gray-600 text-sm ">{user?.bio}</span>
              </div>
            </div>
            <span
              onClick={() => followUnfollowHandler(user._id)}
              className={`text-xs font-bold cursor-pointer ${
                isFollowing
                  ? "text-red-500 hover:text-red-700"
                  : "text-[#3BADF8] hover:text-[#3495d6]"
              }`}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default SuggestedUsers;
