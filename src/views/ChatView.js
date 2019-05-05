import React from 'react'
import { Input, Icon, Layout, Typography, Form, Button, Drawer, Card, Affix } from 'antd';
import API from '../Api.js';

const { Content, Sider, Footer, Header } = Layout;
const { Title } = Typography;

const INITIAL_STATE = {
    roomID: 0,
    lastMessageID: 0,
    message: "",

    selectedUser: {},
    rooms: [],
    messages: [],
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

    handleRoomChange = (id) => {
        API.getRoomMessages(id, 0).then((response) => {
            this.setState({
                roomID: id,
                lastMessageID: (response.data.length > 0) ? response.data[0].id : 0,
                messages: response.data,
            })
        }).catch((error) => {
            alert(error);
        })
    }

    handleMessageChange = (e) => {
        this.setState({
            message: e.target.value
        })
    }

    sendMessage = () => {
        API.sendMessageToRoom(this.state.roomID, { "data": this.state.message }).then((response) => {
            this.setState({
                message: "",
            })
        }).catch((error) => {
            alert(error)
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
            alert(error);
        })
    }

    getRooms = () => {
        API.getRooms().then((response) => {
            this.setState({
                rooms: response.data,
            })
        }).catch((error) => {
            alert(error.response.data);
        })
    }

    renderRoomList = () => {
        return (
            this.state.rooms.map((data) => (
                <Button key={data.id} onClick={() => this.handleRoomChange(data.id)} block style={{ marginBottom: "6px" }}>Room {data.id}</Button>
            ))
        )
    };

    handleUsernameClick = (id) => {
        API.getUser(id).then((response) => {
            this.setState({
                selectedUser: response.data,
            })
        }).catch((error) => {
            alert(error.response.data);
        })
    }

    renderMessages = () => {
        return (
            this.state.messages.map((data) => (
                <Card onClick={() => this.handleUsernameClick(data.user.id)} key={data.id} size="small" title={data.user.username} style={{ marginBottom: "14px" }}>
                    {data.data}
                </Card>
            ))
        )
    };

    render() {
        return (
            <Layout>
                <Sider style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, padding: "12px" }}>
                    {this.renderRoomList()}
                </Sider>
                <Layout style={{ marginLeft: 200 }}>
                    <Header style={{ height: "65px", position: 'fixed', top: 0, width: "100%", zIndex: 9, backgroundColor: "#5461fb" }}>
                        <Input onChange={this.handleMessageChange} value={this.state.message} placeholder="Type your message here..." style={{ display: "inline-block", width: "70%", maxWidth: "400px" }} />
                        <Button onClick={this.sendMessage} style={{ marginLeft: "4px", display: "inline-block" }}>Send</Button>
                    </Header>

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
