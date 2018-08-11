import React, {Component} from 'react';
import { Button, StyleSheet, View, TextInput, Text, WebView } from 'react-native';
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';
import HTMLView from 'react-native-htmlview';
import { parse } from 'subtitle';
import IronMan from './IronMan';
type Props = {};

export default class App extends Component<Props> {
  state = {
    file: undefined,
    delay: '90',
    playing: false,
    startTime: undefined
  }


  play = () => {
    const { delay } = this.state;

    this.setState({
      startTime: Date.now(),
      playing: true
    }, () => {
      this.queueSubtitles();
    })
  }

  pause = () => {
    this.clearIntervals();
    this.setState({
      paused: true,
      text: undefined
    })
  }

  resume = () => {
    this.setState({
      paused: false
    }, () => {
      this.queueSubtitles();
    });

  }

  clearIntervals = () => {
    clearInterval(this.subtitleLoop);
    clearTimeout(this.showTextStartTimeout);
    clearTimeout(this.showTextEndTimeout);
  }

  stop = () => {
    this.clearIntervals();
    this.setState({
      file: undefined,
      playing: false,
      startTime: undefined
    })
  }

  loadFile = () => {
    // For testing purposes, we're loading in a hard-coded subtitle file.
    // Use DocumentPicker
    this.setState({file: IronMan});

    // DocumentPicker.show({
    //   filetype: [DocumentPickerUtil.allFiles()],
    // },(error,res) => {
    //   // Android
    //   console.log(
    //     res.uri,
    //     res.type, // mime type
    //     res.fileName,
    //     res.fileSize
    //   );
    // });
  }

  queueSubtitles = () => {
    const { file, startTime, delay } = this.state;
    const mySubs = parse(file);
    const delayMS = parseInt(delay) * 1000;
    this.setState({playing: true});


    // Loops 60 times per second to check if the subtitle text
    // needs updating.
    // TODO: Benchmark to see if its laggy & potentially improve the Array.find perf.
    this.subtitleLoop = setInterval(() => {
      const progress = Date.now() - startTime + delayMS;
      const result = mySubs.find(sub => (sub.start >= progress));
      if (result) {
        this.showTextStartTimeout = setTimeout(() => {
          this.setState({text: result.text})
        }, result.start - progress);
        this.showTextEndTimeout = setTimeout(() => {
          this.setState({text: ''})
        }, result.end - progress);
      }
    }, 16);
  }

  render() {
    const { file, playing, text, delay, paused } = this.state;
    return (
      <View style={styles.container}>
        {file && !playing && <View style={styles.inputGroup}>
          <TextInput style={styles.input} value={delay} onChangeText={delay => (this.setState({delay}))} />
          <Button onPress={this.play} title={'Play'} />
        </View>}
        {!file && !playing && <Button title={'Load File'} onPress={this.loadFile} />}
        {playing && <View style={styles.playingGroup}>
          <HTMLView style={styles.htmlView} value={'<span>' + (text || '') + '</span>'} stylesheet={htmlStyles} />
        </View>}
        {playing && <View style={styles.playControls}>
          <Button title={paused ? 'Resume' : 'Pause'} onPress={paused ? this.resume : this.pause} />
          <Button title={'Stop'} onPress={this.stop} />
        </View>}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9e9ef',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 4,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    width: '100%'
  },
  inputGroup: {
    flex: 1,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingGroup: {
    flex: 1,
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  playControls: {
    flex: 1,
    left: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20
  },
  htmlView: {
    width: '100%',
    height: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const htmlStyles = StyleSheet.create({
  b: {
    fontWeight: 'bold'
  },
  i: {
    fontStyle: 'italic'
  },
  span: {
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center'
  }
})