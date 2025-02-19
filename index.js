const { APIMessage, Structures } = require("discord.js");

class Message extends Structures.get("Message") {
  //async lineReply(content, options) {
  async lineReply(bool,content,options){
    if(bool===true){
      let mentionRepliedUser = typeof ((options || content || {}).allowedMentions || {}).repliedUser === "undefined" ? true : ((options || content).allowedMentions).repliedUser;

      const apiMessage = content instanceof APIMessage ? content.resolveData() : APIMessage.create(this.channel, content, options).resolveData();
      Object.assign(apiMessage.data, { message_reference: { message_id: this.id } });

      if (!apiMessage.data.allowed_mentions || Object.keys(apiMessage.data.allowed_mentions).length === 0) {
        apiMessage.data.allowed_mentions = {
          parse: ["users", "roles", "everyone"]
        }
      }

      if (typeof apiMessage.data.allowed_mentions.replied_user === "undefined") {
        Object.assign(apiMessage.data.allowed_mentions, { replied_user: mentionRepliedUser });
      }

      if (Array.isArray(apiMessage.data.content)) {
        return Promise.all(apiMessage.split().map(x => {
          x.data.allowed_mentions = apiMessage.data.allowed_mentions;
          return x;
        }).map(this.lineReply.bind(this)));
      }

      const { data, files } = await apiMessage.resolveFiles();
      return this.client.api.channels[this.channel.id].messages
        .post({ data, files })
        .then(d => this.client.actions.MessageCreate.handle(d).message);
    }else if(bool===false){

  //async lineReplyNoMention(content, options) {

    /*if (!options) {
      options = {
        allowedMentions: {
          repliedUser: false
        }
      }
    }

    if (options.allowedMentions) {
      if (options.allowedMentions.repliedUser !== false) {
        options.allowedMentions.repliedUser = false;
      }
    }*/

      const apiMessage = content instanceof APIMessage ? content.resolveData() : APIMessage.create(this.channel, content, options).resolveData();
      Object.assign(apiMessage.data, { message_reference: { message_id: this.id } });

      if (!apiMessage.data.allowed_mentions || Object.keys(apiMessage.data.allowed_mentions).length === 0) {
        apiMessage.data.allowed_mentions = {
          parse: ["users", "roles", "everyone"]
        }
      }

      Object.assign(apiMessage.data.allowed_mentions, { replied_user: false });

      if (Array.isArray(apiMessage.data.content)) {
        return Promise.all(apiMessage.split().map(x => {
          x.data.allowed_mentions = apiMessage.data.allowed_mentions;
          return x;
        }).map(this.lineReply.bind(this)));
      }

      const { data, files } = await apiMessage.resolveFiles();
      return this.client.api.channels[this.channel.id].messages
        .post({ data, files })
        .then(d => this.client.actions.MessageCreate.handle(d).message);
    }else{
      throw new Error(`${bool.toString} is not a valid boolean`); 
    }
  }
}

Structures.extend("Message", () => Message);
