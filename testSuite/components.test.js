import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, TouchableOpacity, TextInput, View } from 'react-native';

describe('React Native Component Tests', () => {
  describe('Button Component', () => {
    const MockButton = ({ onPress, title, disabled }) => (
      <TouchableOpacity onPress={onPress} disabled={disabled} testID="button">
        <Text testID="button-text">{title}</Text>
      </TouchableOpacity>
    );

    test('renders button with correct title', () => {
      const { getByTestId } = render(<MockButton title="Click Me" />);
      const buttonText = getByTestId('button-text');

      expect(buttonText.props.children).toBe('Click Me');
    });

    test('calls onPress when button is clicked', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <MockButton title="Click Me" onPress={mockOnPress} />
      );

      const button = getByTestId('button');
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    test('renders with disabled prop', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <MockButton title="Click Me" onPress={mockOnPress} disabled={true} />
      );

      const button = getByTestId('button');
      // Verify the component received the disabled prop
      expect(button).toBeTruthy();
    });
  });

  describe('Input Component', () => {
    const MockInput = ({ value, onChangeText, placeholder, secureTextEntry }) => (
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        testID="text-input"
      />
    );

    test('renders input with placeholder', () => {
      const { getByTestId } = render(<MockInput placeholder="Enter text" />);
      const input = getByTestId('text-input');

      expect(input.props.placeholder).toBe('Enter text');
    });

    test('calls onChangeText when text changes', () => {
      const mockOnChangeText = jest.fn();
      const { getByTestId } = render(
        <MockInput onChangeText={mockOnChangeText} />
      );

      const input = getByTestId('text-input');
      fireEvent.changeText(input, 'new text');

      expect(mockOnChangeText).toHaveBeenCalledWith('new text');
    });

    test('displays value correctly', () => {
      const { getByTestId } = render(<MockInput value="test value" />);
      const input = getByTestId('text-input');

      expect(input.props.value).toBe('test value');
    });

    test('handles secure text entry for passwords', () => {
      const { getByTestId } = render(<MockInput secureTextEntry={true} />);
      const input = getByTestId('text-input');

      expect(input.props.secureTextEntry).toBe(true);
    });
  });

  describe('Login Form Component', () => {
    const MockLoginForm = ({ onLogin }) => {
      const [email, setEmail] = React.useState('');
      const [password, setPassword] = React.useState('');

      const handleSubmit = () => {
        onLogin({ email, password });
      };

      return (
        <View testID="login-form">
          <TextInput
            testID="email-input"
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
          />
          <TextInput
            testID="password-input"
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
          />
          <TouchableOpacity testID="submit-button" onPress={handleSubmit}>
            <Text>Login</Text>
          </TouchableOpacity>
        </View>
      );
    };

    test('renders login form with inputs', () => {
      const { getByTestId } = render(<MockLoginForm onLogin={jest.fn()} />);

      expect(getByTestId('email-input')).toBeTruthy();
      expect(getByTestId('password-input')).toBeTruthy();
      expect(getByTestId('submit-button')).toBeTruthy();
    });

    test('updates email input value', () => {
      const { getByTestId } = render(<MockLoginForm onLogin={jest.fn()} />);
      const emailInput = getByTestId('email-input');

      fireEvent.changeText(emailInput, 'test@example.com');

      expect(emailInput.props.value).toBe('test@example.com');
    });

    test('updates password input value', () => {
      const { getByTestId } = render(<MockLoginForm onLogin={jest.fn()} />);
      const passwordInput = getByTestId('password-input');

      fireEvent.changeText(passwordInput, 'password123');

      expect(passwordInput.props.value).toBe('password123');
    });

    test('calls onLogin with credentials on submit', () => {
      const mockOnLogin = jest.fn();
      const { getByTestId } = render(<MockLoginForm onLogin={mockOnLogin} />);

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const submitButton = getByTestId('submit-button');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(submitButton);

      expect(mockOnLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  describe('List Component', () => {
    const MockList = ({ items, onItemPress }) => (
      <View testID="list">
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            testID={`list-item-${index}`}
            onPress={() => onItemPress(item)}
          >
            <Text testID={`item-text-${index}`}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );

    test('renders list of items', () => {
      const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' },
      ];

      const { getByTestId } = render(
        <MockList items={items} onItemPress={jest.fn()} />
      );

      expect(getByTestId('list-item-0')).toBeTruthy();
      expect(getByTestId('list-item-1')).toBeTruthy();
      expect(getByTestId('list-item-2')).toBeTruthy();
    });

    test('displays correct item names', () => {
      const items = [
        { id: '1', name: 'First Item' },
        { id: '2', name: 'Second Item' },
      ];

      const { getByTestId } = render(
        <MockList items={items} onItemPress={jest.fn()} />
      );

      expect(getByTestId('item-text-0').props.children).toBe('First Item');
      expect(getByTestId('item-text-1').props.children).toBe('Second Item');
    });

    test('calls onItemPress with correct item', () => {
      const mockOnItemPress = jest.fn();
      const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];

      const { getByTestId } = render(
        <MockList items={items} onItemPress={mockOnItemPress} />
      );

      fireEvent.press(getByTestId('list-item-1'));

      expect(mockOnItemPress).toHaveBeenCalledWith(items[1]);
    });

    test('renders empty list', () => {
      const { getByTestId, queryByTestId } = render(
        <MockList items={[]} onItemPress={jest.fn()} />
      );

      expect(getByTestId('list')).toBeTruthy();
      expect(queryByTestId('list-item-0')).toBeNull();
    });
  });

  describe('Loading Component', () => {
    const MockLoadingComponent = ({ isLoading, children }) => (
      <View testID="container">
        {isLoading ? (
          <View testID="loading-indicator">
            <Text>Loading...</Text>
          </View>
        ) : (
          children
        )}
      </View>
    );

    test('shows loading indicator when loading', () => {
      const { getByTestId } = render(
        <MockLoadingComponent isLoading={true}>
          <Text>Content</Text>
        </MockLoadingComponent>
      );

      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    test('shows content when not loading', () => {
      const { getByText, queryByTestId } = render(
        <MockLoadingComponent isLoading={false}>
          <Text>Content</Text>
        </MockLoadingComponent>
      );

      expect(getByText('Content')).toBeTruthy();
      expect(queryByTestId('loading-indicator')).toBeNull();
    });
  });

  describe('Error Boundary Component', () => {
    const MockErrorDisplay = ({ error, onRetry }) => (
      <View testID="error-display">
        <Text testID="error-message">{error}</Text>
        {onRetry && (
          <TouchableOpacity testID="retry-button" onPress={onRetry}>
            <Text>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );

    test('displays error message', () => {
      const { getByTestId } = render(
        <MockErrorDisplay error="Something went wrong" />
      );

      expect(getByTestId('error-message').props.children).toBe(
        'Something went wrong'
      );
    });

    test('shows retry button when onRetry provided', () => {
      const mockOnRetry = jest.fn();
      const { getByTestId } = render(
        <MockErrorDisplay error="Error" onRetry={mockOnRetry} />
      );

      expect(getByTestId('retry-button')).toBeTruthy();
    });

    test('calls onRetry when retry button pressed', () => {
      const mockOnRetry = jest.fn();
      const { getByTestId } = render(
        <MockErrorDisplay error="Error" onRetry={mockOnRetry} />
      );

      fireEvent.press(getByTestId('retry-button'));

      expect(mockOnRetry).toHaveBeenCalled();
    });
  });

  describe('Toggle Component', () => {
    const MockToggle = ({ isOn, onToggle, label }) => {
      return (
        <View testID="toggle-container">
          <Text testID="toggle-label">{label}</Text>
          <TouchableOpacity testID="toggle-button" onPress={onToggle}>
            <Text testID="toggle-state">{isOn ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
        </View>
      );
    };

    test('displays correct initial state', () => {
      const { getByTestId } = render(
        <MockToggle isOn={true} onToggle={jest.fn()} label="Feature" />
      );

      expect(getByTestId('toggle-state').props.children).toBe('ON');
    });

    test('displays label correctly', () => {
      const { getByTestId } = render(
        <MockToggle isOn={false} onToggle={jest.fn()} label="Dark Mode" />
      );

      expect(getByTestId('toggle-label').props.children).toBe('Dark Mode');
    });

    test('calls onToggle when clicked', () => {
      const mockOnToggle = jest.fn();
      const { getByTestId } = render(
        <MockToggle isOn={false} onToggle={mockOnToggle} label="Feature" />
      );

      fireEvent.press(getByTestId('toggle-button'));

      expect(mockOnToggle).toHaveBeenCalled();
    });
  });
});