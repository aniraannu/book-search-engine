const { User } = require("../models");
const { signToken, AuthenticationError } = require("../utils/auth");
module.exports = {
  Query: {
    async getSingleUser(parent, args, context) {
      const foundUser = await User.findOne({
        $or: [
          { _id: context.user ? context.user._id : args.id },
          { username: args.username },
        ],
      });

      if (!foundUser) {
        return null;
      }
      return foundUser;
    },
    async me(parent, args, context) {
      if (!context.user) {
        console.log("error occurs");
        throw AuthenticationError;
      }
      const user = await User.findOne({ _id: context.user._id });
      console.log("user:", user);
      return User.findOne({
        _id: context.user._id,
      });
    },
  },
  Mutation: {
    async createUser(parent, args, context) {
      const user = await User.create(args);

      if (!user) {
        return null;
      }
      const token = signToken(user);
      return { token, user };
    },
    async login(parent, args, context) {
      const user = await User.findOne({
        $or: [{ username: args.username }, { email: args.email }],
      });
      if (!user) {
        return null;
      }
      const correctPw = await user.isCorrectPassword(args.password);
      if (!correctPw) {
        return null;
      }
      const token = signToken(user);
      return { token, user };
    },
    async saveBook(parent, args, context) {
      console.log(context.user);
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: args } },
          { new: true, runValidators: true }
        );
        console.log(updatedUser);
        return updatedUser;
      } catch (err) {
        console.log(err);
        return null;
      }
    },
    async deleteBook(parent, args, context) {
      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId: args.bookId } } },
        { new: true }
      );
      if (!updatedUser) {
        return null;
      }
      return updatedUser;
    },
  },
};
