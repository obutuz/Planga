import socket from "./socket";


let addMessage = (messages_list_elem, author_name, content, sent_at) => {
    $(messages_list_elem).append(message_html(author_name, content, sent_at));
    $(messages_list_elem).prop({scrollTop: messages_list_elem.prop("scrollHeight")});
};


let addMessageTop = (messages_list_elem, author_name, content, sent_at) => {
    $(messages_list_elem).prepend(message_html(author_name, content, sent_at));
};



let message_html = (author_name, content, sent_at) => (
    `
    <dl class='plange--chat-message' data-message-sent-at='${sent_at}'>
            <dt class='plange--chat-author-wrapper'>
            <span class='plange--chat-author-name'>${author_name}</span><span class='plange--chat-message-separator'>: </span></dt>
            <dd class='plange--chat-message-content' >${content}</dd>
    </dl>
    `
)

let sendMessage = (message_field, channel) => {
    channel.push('new_message', { message: message_field.val() });
    message_field.val('');
}

let callWithBottomFixedVscroll = (elem, func) => {
    let current_scroll_pos = $(elem).prop('scrollHeight') - $(elem).scrollTop();
    func();
    $(elem).prop({scrollTop: $(elem).prop('scrollHeight') - current_scroll_pos});
}

class Plange {
    constructor(options) {
        this.current_user_hmac = options.current_user_hmac;
        this.current_user_id = options.current_user_id;
        this.app_id = options.app_id;
    }

    createCommuncationSection (chat_container_elem, conversation_id, conversation_id_hmac) {
        let container = $(chat_container_elem);
        console.log(container);
        container.html(
            `<div class='plange--chat-container'>
                <div class='plange--chat-messages'>
                </div>
                <div class='plange--new-message-form'>
                    <div class='plange--new-message-field-wrapper'>
                        <input type='text' name='plange--new-message-field' class='plange--new-message-field'/>
                    </div>
                    <button class='plange--new-message-submit-button'>Send</button>
                </div>
            </div>`
        );
        let messages_list_elem    = $('.plange--chat-messages', container);
        console.log(messages_list_elem);
        let channel = socket.channel("chat:"+conversation_id, {
            app_id: this.app_id,
            remote_user_id: this.current_user_id,
            remote_user_id_hmac: this.current_user_hmac,
            conversation_id_hmac: conversation_id_hmac
        });

        channel.on('new_message', payload => {
            console.log("Plange: New Message", payload);
            let author_name = payload.name || "Anonymous";
            addMessage(messages_list_elem, author_name, payload.content, payload.sent_at);
        });

        let loading_new_messages = false;
        channel.on('messages_so_far', payload => {
            loading_new_messages = false;
            console.log("Plange: Messages So Far Payload", payload);
            callWithBottomFixedVscroll(messages_list_elem, () => {
                payload.messages.forEach(message => {
                    let author_name = message.name || "Anonymous";
                    addMessageTop($(messages_list_elem), author_name, message.content, message.sent_at);
                    console.log(message);
                });
            });
        });

        $(messages_list_elem).on('scroll', event => {
            console.log($(messages_list_elem).scrollTop(), $(messages_list_elem).innerHeight());
            if($(messages_list_elem).scrollTop() < 50 && !loading_new_messages) {
                loading_new_messages = true;
                channel.push('load_old_messages', { sent_before: $('.plange--chat-message:first', messages_list_elem).data('message-sent-at') });
            };
        });

        channel.join()
            .receive("ok", resp => {
                console.log("Joined Plange communication successfully.", resp);
            })
            .receive("error", resp => {
                console.log("Unable to join Plange communication: ", resp);
            });

        let message_field = $('.plange--new-message-field', container);
        message_field.on('keypress', event => {
            if (event.keyCode == 13) {
                sendMessage(message_field, channel);
            }
        });
        let message_button = $('.plange--new-message-submit-button', container);
        message_button.on('click', event => {
            sendMessage(message_field, channel);
        });
    }
}
// Export to outside world
window.Plange = Plange;

// Usage Example:
$(function(){
    let app_id = '1';
    let conversation_id = "asdf";
    let conversation_id_hmac = "Syv/GTCGSFSYtRVKxq7ECm2/M320i2Dby7jOl7+057E=";
    let messages_list_elem    = $('#plange-example');
    let message = $('#message');
    // let name    = $('#name');
    let remote_user_id = '1234';
    let remote_user_id_hmac = "5ZS5CUUX7eg3/nNw7TevR6PyUfEMrtPRN/V7s7JhdTw="; // Based on API key 'topsecret' for app id '1', with HMAC message '1234' (the user's remote ID)

    let plange = new Plange({app_id: '1', current_user_id: '1234', current_user_hmac: remote_user_id_hmac});
    plange.createCommuncationSection($(messages_list_elem), conversation_id, conversation_id_hmac);

});

window.Plange = Plange;