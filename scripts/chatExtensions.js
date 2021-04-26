export function printChatMessage(content, user = undefined) {
  ChatMessage.create(
    // Data
    {
      user: user ?? game.user._id,
      content: content,
    },
    //Options
    {}
  );
}
