import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Button, Alert, Text, StyleSheet, ScrollView, FlatList, KeyboardAvoidingView } from 'react-native';  

export default function App() {
  const [text, setText] = useState('');
  const [data, setData] = useState([]);

  const scrollViewRef = useRef(null);

  useEffect(() => {
    // Add an introductory message from the system when the component mounts
    const systemIntroMessage = {
      role: 'system',
      content:
        "Act like my friend. Be my personal therapist and ask me questions about myself and my health. Do not state that you're an AI.",
    };
    const introMessage = {
      role: 'assistant',
      content:
        "Hey friend, anything you would like to talk about? As your personal therapist, I'm here for you.",
    };
    setData([systemIntroMessage, introMessage]);
  }, []);

  const handleTextChange = (inputText) => {
    setText(inputText);
  };

  const sendDataToAPI = () => {
    const updatedData = [...data, { role: 'user', content: text }];
    fetch('http://129.146.106.229:5000/process-string', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    })
      .then((response) => response.text()) // Parse response as text instead of JSON
      .then((responseData) => {
        const apiResponse = responseData;
        const assistantData = { role: 'assistant', content: apiResponse };
        const updatedDataWithAssistant = [...updatedData, assistantData];
        setData(updatedDataWithAssistant);
        setText('');
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
      >
        {data.map((message, index) => {
          if (message.role === 'system' && index > 0) {
            return null; // Hide subsequent system messages from the user
          }

          return (
            <View
              key={index}
              style={[
                styles.messageContainer,
                message.role === 'user' ? styles.userMessageContainer : styles.assistantMessageContainer,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.role === 'user' ? styles.userMessageBubble : styles.assistantMessageBubble,
                  message.role === 'system' ? styles.systemMessageBubble : null, // Apply systemMessageBubble style to system messages
                ]}
              >
                <Text style={message.role === 'assistant' ? styles.assistantMessageText : styles.systemMessageText}>
                  {message.content}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Message"
          value={text}
          onChangeText={handleTextChange}
        />
        <Button title="Send" onPress={sendDataToAPI} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  messagesContainer: {
    flexGrow: 1,
    padding: 10,
  },
  messageContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 1,
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  assistantMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userMessageBubble: {
    backgroundColor: '#007AFF',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 16,
  },
  assistantMessageBubble: {
    backgroundColor: '#E4E5E8',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  systemMessageBubble: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userMessageText: {
    fontSize: 16,
    color: '#fff',
  },
  assistantMessageText: {
    fontSize: 16,
    color: '#000',
  },
  systemMessageText: {
    fontSize: 16,
    color: '#f0f0f0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  textInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 10,
    backgroundColor: '#fff', // Set the background color of the text input
  },
});