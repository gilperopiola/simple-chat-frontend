import React from 'react'
import { Input, Layout, Button, Drawer, Card } from 'antd';
import API from '../Api.js';

const { Content, Sider, Header } = Layout;

const INITIAL_STATE = {
    roomID: 0,
    lastMessageID: 0,
    message: "",
    messages: [],
    rooms: [],
    selectedUser: {},
}

class ChatView extends React.Component {
    constructor(props) {
        super(props);
        this.state = INITIAL_STATE;
        this.getRooms();
    }

    componentDidMount() {
        this.interval = setInterval(() => this.fetchNewMessages(), 1000);
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }

    sendMessage = () => {
        if (this.state.message.startsWith("/")) {
            let command = { command: this.state.message }

            API.sendCommand(command).then((response) => {
                let stockMsg = [{ id: 0, user: {}, data: response.data }]
                let allMessages = stockMsg.concat(this.state.messages);
                if (allMessages.length > 50) {
                    allMessages.length = 50;
                }

                this.setState({
                    message: "",
                    messages: allMessages,
                })
            }).catch((error) => {
                if (error.response.data) {
                    alert(error.response.data);
                }
            })
            return;
        }

        API.sendMessageToRoom(this.state.roomID, { "data": this.state.message }).then((response) => {
            this.setState({
                message: "",
            })
        }).catch((error) => {
            if (error.response.data) {
                alert(error.response.data);
            }
        })
    }

    fetchNewMessages = () => {
        if (this.state.roomID < 1) {
            return;
        }

        API.getRoomMessages(this.state.roomID, this.state.lastMessageID).then((response) => {
            this.setState({
                lastMessageID: (response.data.length > 0) ? response.data[0].id : this.state.lastMessageID,
                messages: response.data.concat(this.state.messages),
            })
        }).catch((error) => {
            if (error.response.data) {
                alert(error.response.data);
            }
        })
    }

    getRooms = () => {
        API.getRooms().then((response) => {
            this.setState({
                rooms: response.data,
            })
        }).catch((error) => {
            if (error.response.data) {
                alert(error.response.data);
            }
        })
    }

    renderRoomList = () => {
        return (
            this.state.rooms.map((data) => (
                <Button key={data.id} onClick={() => this.handleRoomChange(data.id)} block style={{ marginBottom: "6px" }}>Room {data.id}</Button>
            ))
        )
    };


    renderMessages = () => {
        return (
            this.state.messages.map((data, i) => (
                <Card onClick={() => this.handleUsernameClick(data.user.id)} key={data.id} size="small" title={data.user.username} style={{ marginBottom: "14px", cursor: "pointer" }}>
                    {data.data}
                </Card>
            ))
        )
    };

    handleRoomChange = (id) => {
        API.getRoomMessages(id, 0).then((response) => {
            if (response.data.length > 50) {
                response.data.length = 50;
            }

            this.setState({
                roomID: id,
                lastMessageID: (response.data.length > 0) ? response.data[0].id : 0,
                messages: response.data,
            })
        }).catch((error) => {
            if (error.response.data) {
                alert(error.response.data);
            }
        })
    }

    handleMessageChange = (e) => {
        this.setState({
            message: e.target.value
        })
    }

    handleUsernameClick = (id) => {
        if (id === undefined) {
            return;
        }

        API.getUser(id).then((response) => {
            this.setState({
                selectedUser: response.data,
            })
        }).catch((error) => {
            if (error.response.data) {
                alert(error.response.data);
            }
        })
    }

    logOut = () => {
        localStorage.clear();
        window.location.assign('/');
    }

    render() {
        return (
            <Layout>
                <Sider style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, padding: "12px" }}>
                    {this.renderRoomList()}
                    <Button onClick={this.logOut} style={{ marginTop: "24px" }}>Log out</Button>
                </Sider>
                <Layout style={{ marginLeft: 200 }}>
                    {this.state.roomID !== 0 &&
                        <Header style={{ height: "65px", position: 'fixed', top: 0, width: "100%", zIndex: 9, backgroundColor: "#5461fb" }}>
                            <Input onChange={this.handleMessageChange} value={this.state.message} placeholder="Type your message here..." style={{ display: "inline-block", width: "70%", maxWidth: "400px" }} />
                            <Button onClick={this.sendMessage} style={{ marginLeft: "4px", display: "inline-block" }}>Send</Button>
                        </Header>
                    }

                    <Content style={{ padding: '65px 16px 0', overflow: 'initial', backgroundColor: "#5461fb" }}>
                        {this.renderMessages()}
                    </Content>

                    <Drawer
                        title={this.state.selectedUser.username}
                        placement="right"
                        mask={false}
                        onClose={() => this.setState({ selectedUser: {} })}
                        visible={this.state.selectedUser.id > 0}
                    >
                        <p>ID: {this.state.selectedUser.id}</p>
                    </Drawer>

                </Layout>
            </Layout >
        )
    }
}

export default ChatView;
