# Testing Documentation

This directory contains all testing-related documentation for the Zenjin Maths App rebuild project, following the APML Framework.

## Files

- `testing_strategy.md`: Comprehensive testing approach for the project

## Testing Philosophy

The testing approach is guided by the following principles:

1. **Distinction-Based Validation**: All components must be validated through explicit test-linked criteria, following Axiom 5 of the APML Framework.

2. **Dual Validation Approach**: Combining automated testing for objective criteria with human evaluation for subjective aspects.

3. **Progressive Verification**: Testing occurs at multiple stages of development rather than only at the end.

4. **Interface-First Testing**: Tests validate that implementations fulfill their interface contracts.

5. **Context-Aware Evaluation**: Tests consider the component's purpose and context within the larger system.

## Validation Criteria

Components are validated against specific criteria defined in the module definitions. For example, the UserInterface module has the following validation criteria:

- **UI-001**: Player Card must show greenish glow for correct answers, reddish glow with card shudder for incorrect answers, and neutral blue for no-answer scenarios.
- **UI-002**: Background must display calming bubble animation that maintains 60fps on target devices.
- **UI-003**: All UI components must consistently apply the theme with rich colors, gradients, and dark theme.
- **UI-004**: Session Summary must correctly display and animate all session metrics.
- **UI-005**: Dashboard must correctly display all lifetime metrics including Evolution and Global Ranking.
- **UI-006**: UI must be accessible for the target audience of school-aged children from age 6 and up.