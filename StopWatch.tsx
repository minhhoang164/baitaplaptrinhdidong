import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableNativeFeedback } from 'react-native';
import moment from 'moment';

interface State {
  start: number;
  now: number;
  laps: number[];
}

export default class App extends Component<{}, State> {
  timer: any;

  constructor(props: {}) {
    super(props);
    this.state = {
      start: 0,
      now: 0,
      laps: [],
    };
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  start = () => {
    const now = new Date().getTime();
    this.setState({
      start: now,
      now,
      laps: [0],
    });
    this.timer = setInterval(() => {
      this.setState({ now: new Date().getTime() });
    }, 100);
  };

  lap = () => {
    const timestamp = new Date().getTime();
    const { laps, now, start } = this.state;
    const [firstLap, ...other] = laps;
    this.setState({
      laps: [0, firstLap + now - start, ...other],
      start: timestamp,
      now: timestamp,
    });
  };

  stop = () => {
    clearInterval(this.timer);
    const { laps, now, start } = this.state;
    const [firstLap, ...other] = laps;
    this.setState({
      laps: [firstLap + now - start, ...other],
      start: 0,
      now: 0,
    });
  };

  reset = () => {
    this.setState({
      laps: [],
      start: 0,
      now: 0,
    });
  };

  resume = () => {
    const now = new Date().getTime();
    this.setState({
      start: now,
      now,
    });
    this.timer = setInterval(() => {
      this.setState({ now: new Date().getTime() });
    }, 100);
  };

  render() {
    const { now, start, laps } = this.state;
    const timer = now - start;

    return (
      <View style={styles.container}>
        <Timer
          interval={laps.reduce((total, curr) => total + curr, 0) + timer}
          style={styles.timer}
        />
        {laps.length === 0 && (
          <ButtonsRow>
            <RoundButton
              title="Lap"
              color="#8B8B90"
              background="#151515"
              disabled
            />
            <RoundButton
              title="Start"
              color="#50D167"
              background="#1B361F"
              onPress={this.start}
            />
          </ButtonsRow>
        )}
        {start > 0 && (
          <ButtonsRow>
            <RoundButton
              title="Lap"
              color="#FFFFFF"
              background="#3D3D3D"
              onPress={this.lap}
            />
            <RoundButton
              title="Stop"
              color="#E33935"
              background="#3C1715"
              onPress={this.stop}
            />
          </ButtonsRow>
        )}
        {laps.length > 0 && start === 0 && (
          <ButtonsRow>
            <RoundButton
              title="Reset"
              color="#FFFFFF"
              background="#3D3D3D"
              onPress={this.reset}
            />
            <RoundButton
              title="Start"
              color="#50D167"
              background="#1B361F"
              onPress={this.resume}
            />
          </ButtonsRow>
        )}
        <LapsTable laps={laps} timer={timer} />
      </View>
    );
  }
}

function Timer({ interval, style }: { interval: number; style: any }) {
  const pad = (n: number) => (n < 10 ? '0' + n : n);
  const duration = moment.duration(interval);
  const centiseconds = Math.floor(duration.milliseconds() / 10);
  return (
    <View style={styles.timerContainer}>
      <Text style={style}>{pad(duration.minutes())}:</Text>
      <Text style={style}>{pad(duration.seconds())},</Text>
      <Text style={style}>{pad(centiseconds)}</Text>
    </View>
  );
}

function RoundButton({ title, color, background, onPress, disabled }: any) {
  return (
    <TouchableNativeFeedback
      onPress={() => !disabled && onPress()}
      background={TouchableNativeFeedback.Ripple('rgba(0,0,0,0.6)', false)}
      disabled={disabled}
    >
      <View style={[styles.button, { backgroundColor: background }]}>
        <Text style={[styles.buttonTitle, { color }]}>{title}</Text>
      </View>
    </TouchableNativeFeedback>
  );
}

function Lap({ number, interval, fastest, slowest }: any) {
  const lapStyle = [
    styles.lapText,
    fastest && styles.fastest,
    slowest && styles.slowest,
  ];
  return (
    <View style={styles.lap}>
      <Text style={lapStyle}>Lap {number}</Text>
      <Timer style={[lapStyle, styles.lapTimer]} interval={interval} />
    </View>
  );
}

function LapsTable({ laps, timer }: { laps: number[]; timer: number }) {
  const finishedLaps = laps.slice(1);
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;
  if (finishedLaps.length >= 2) {
    finishedLaps.forEach((lap) => {
      if (lap < min) min = lap;
      if (lap > max) max = lap;
    });
  }
  return (
    <ScrollView style={styles.scrollView}>
      {laps.map((lap, index) => (
        <Lap
          number={laps.length - index}
          key={laps.length - index}
          interval={index === 0 ? timer + lap : lap}
          fastest={lap === min}
          slowest={lap === max}
        />
      ))}
    </ScrollView>
  );
}

function ButtonsRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.buttonsRow}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  timer: {
    color: '#FFFFFF',
    fontSize: 76,
    fontWeight: '200',
    width: 110,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTitle: {
    fontSize: 18,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    marginTop: 80,
    marginBottom: 30,
  },
  lapText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  lapTimer: {
    width: 30,
  },
  lap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: '#151515',
    borderTopWidth: 1,
    paddingVertical: 10,
  },
  scrollView: {
    alignSelf: 'stretch',
  },
  fastest: {
    color: '#4BC05F',
  },
  slowest: {
    color: '#CC3531',
  },
  timerContainer: {
    flexDirection: 'row',
  },
});
