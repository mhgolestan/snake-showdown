import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameControls } from './GameControls';

describe('GameControls', () => {
    const defaultProps = {
        mode: 'walls' as const,
        isPaused: true,
        isGameOver: false,
        score: 100,
        onStart: vi.fn(),
        onPause: vi.fn(),
        onReset: vi.fn(),
        onModeChange: vi.fn(),
    };

    it('renders score correctly', () => {
        render(<GameControls {...defaultProps} score={420} />);
        expect(screen.getByText('420')).toBeInTheDocument();
    });

    it('shows Play button when paused', () => {
        render(<GameControls {...defaultProps} isPaused={true} />);
        expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    });

    it('shows Pause button when playing', () => {
        render(<GameControls {...defaultProps} isPaused={false} />);
        expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });

    it('shows Restart button when game is over', () => {
        render(<GameControls {...defaultProps} isGameOver={true} />);
        expect(screen.getByRole('button', { name: /restart/i })).toBeInTheDocument();
    });

    it('calls onStart when Play is clicked', () => {
        render(<GameControls {...defaultProps} isPaused={true} />);
        fireEvent.click(screen.getByRole('button', { name: /play/i }));
        expect(defaultProps.onStart).toHaveBeenCalled();
    });

    it('calls onPause when Pause is clicked', () => {
        render(<GameControls {...defaultProps} isPaused={false} />);
        fireEvent.click(screen.getByRole('button', { name: /pause/i }));
        expect(defaultProps.onPause).toHaveBeenCalled();
    });

    it('calls onReset when Restart is clicked', () => {
        render(<GameControls {...defaultProps} isGameOver={true} />);
        fireEvent.click(screen.getByRole('button', { name: /restart/i }));
        expect(defaultProps.onReset).toHaveBeenCalled();
    });

    it('calls onModeChange when mode buttons are clicked', () => {
        render(<GameControls {...defaultProps} />);

        fireEvent.click(screen.getByRole('button', { name: /pass-through/i }));
        expect(defaultProps.onModeChange).toHaveBeenCalledWith('pass-through');

        fireEvent.click(screen.getByRole('button', { name: /walls/i }));
        expect(defaultProps.onModeChange).toHaveBeenCalledWith('walls');
    });
});
