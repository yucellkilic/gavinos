import { render, screen, fireEvent } from '@testing-library/react';
import DeliveryTypeSelector from './DeliveryTypeSelector';

describe('DeliveryTypeSelector', () => {
  it('renders with delivery selected', () => {
    const onChange = jest.fn();
    render(<DeliveryTypeSelector value="delivery" onChange={onChange} />);
    
    const deliveryButton = screen.getByRole('button', { name: /select delivery option/i });
    const pickupButton = screen.getByRole('button', { name: /select pickup option/i });
    
    expect(deliveryButton).toBeInTheDocument();
    expect(pickupButton).toBeInTheDocument();
    expect(deliveryButton).toHaveAttribute('aria-pressed', 'true');
    expect(pickupButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders with pickup selected', () => {
    const onChange = jest.fn();
    render(<DeliveryTypeSelector value="pickup" onChange={onChange} />);
    
    const deliveryButton = screen.getByRole('button', { name: /select delivery option/i });
    const pickupButton = screen.getByRole('button', { name: /select pickup option/i });
    
    expect(deliveryButton).toHaveAttribute('aria-pressed', 'false');
    expect(pickupButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onChange with "delivery" when delivery button is clicked', () => {
    const onChange = jest.fn();
    render(<DeliveryTypeSelector value="pickup" onChange={onChange} />);
    
    const deliveryButton = screen.getByRole('button', { name: /select delivery option/i });
    fireEvent.click(deliveryButton);
    
    expect(onChange).toHaveBeenCalledWith('delivery');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('calls onChange with "pickup" when pickup button is clicked', () => {
    const onChange = jest.fn();
    render(<DeliveryTypeSelector value="delivery" onChange={onChange} />);
    
    const pickupButton = screen.getByRole('button', { name: /select pickup option/i });
    fireEvent.click(pickupButton);
    
    expect(onChange).toHaveBeenCalledWith('pickup');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('has minimum touch target size of 44x44 pixels', () => {
    const onChange = jest.fn();
    render(<DeliveryTypeSelector value="delivery" onChange={onChange} />);
    
    const deliveryButton = screen.getByRole('button', { name: /select delivery option/i });
    const pickupButton = screen.getByRole('button', { name: /select pickup option/i });
    
    // Check that min-h-[44px] class is applied
    expect(deliveryButton.className).toContain('min-h-[44px]');
    expect(pickupButton.className).toContain('min-h-[44px]');
  });

  it('applies correct styling for selected state', () => {
    const onChange = jest.fn();
    render(<DeliveryTypeSelector value="delivery" onChange={onChange} />);
    
    const deliveryButton = screen.getByRole('button', { name: /select delivery option/i });
    const pickupButton = screen.getByRole('button', { name: /select pickup option/i });
    
    // Selected button should have white text
    expect(deliveryButton.className).toContain('text-white');
    // Unselected button should have gray text
    expect(pickupButton.className).toContain('text-gray-600');
  });

  it('applies correct styling for unselected state', () => {
    const onChange = jest.fn();
    render(<DeliveryTypeSelector value="pickup" onChange={onChange} />);
    
    const deliveryButton = screen.getByRole('button', { name: /select delivery option/i });
    const pickupButton = screen.getByRole('button', { name: /select pickup option/i });
    
    // Unselected button should have gray text
    expect(deliveryButton.className).toContain('text-gray-600');
    // Selected button should have white text
    expect(pickupButton.className).toContain('text-white');
  });

  it('has smooth transition classes applied', () => {
    const onChange = jest.fn();
    render(<DeliveryTypeSelector value="delivery" onChange={onChange} />);
    
    const deliveryButton = screen.getByRole('button', { name: /select delivery option/i });
    
    // Check for transition-smooth class
    expect(deliveryButton.className).toContain('transition-smooth');
  });

  it('renders label text', () => {
    const onChange = jest.fn();
    render(<DeliveryTypeSelector value="delivery" onChange={onChange} />);
    
    expect(screen.getByText('Delivery Type')).toBeInTheDocument();
  });
});
