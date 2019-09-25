import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, Text, Animated, Easing, ActivityIndicator, View } from 'react-native';
import colors from 'config/colors';
import fontStyles from 'config/fontStyles';
import { screenWidth } from 'config/dimensions';

const MARGIN = 40;

export default class ButtonSubmit extends Component {
  constructor() {
    super();

    this.state = {
      isLoading: false,
    };

    this.buttonAnimated = new Animated.Value(0);
    this.growAnimated = new Animated.Value(0);
    this._onPress = this._onPress.bind(this);
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._onGrow();
    this._isMounted = false;
  }

  _onPress() {
    this.props.onSubmit();
    if (this.state.isLoading) return;

    if (this._isMounted) {
      this.setState({ isLoading: true });
    }

    Animated.timing(this.buttonAnimated, {
      toValue: 1,
      duration: 200,
      easing: Easing.linear,
    }).start();

    setTimeout(() => {
      this._onGrow();
    }, 2000);

    setTimeout(() => {
      // Actions.secondScreen();
      if (this._isMounted) {
        this.setState({ isLoading: false });
      }
      this.buttonAnimated.setValue(0);
      this.growAnimated.setValue(0);
    }, 2300);
  }

  _onGrow() {
    Animated.timing(this.growAnimated, {
      toValue: 1,
      duration: 200,
      easing: Easing.linear,
    }).start();
  }

  render() {
    const changeWidth = this.buttonAnimated.interpolate({
      inputRange: [0, 1],
      outputRange: [screenWidth - MARGIN, MARGIN],
    });
    const changeScale = this.growAnimated.interpolate({
      inputRange: [0, 1],
      outputRange: [1, MARGIN],
    });

    return (
      <View style={[styles.container, this.props.style]}>
        <Animated.View style={{ width: changeWidth, backgroundColor: 'transparent' }}>
          <TouchableOpacity
            style={styles.button}
            onPress={this._onPress}
            activeOpacity={1}>
            {this.state.isLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
                <Text style={fontStyles.mainTextStylePrimaryDark}>{this.props.text}</Text>
              )}
          </TouchableOpacity>
          <Animated.View
            style={[styles.circle, { transform: [{ scale: changeScale }] }]}
          />

        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
  },
  button: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    height: MARGIN,
    borderRadius: 20,
    zIndex: 10,
  },
  circle: {
    height: MARGIN,
    width: MARGIN,
    marginTop: -MARGIN,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: 100,
    alignSelf: 'center',
    zIndex: 9,
    backgroundColor: colors.primaryLight,
  },
  image: {
    width: 24,
    height: 24,
  },
});
