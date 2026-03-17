export interface RouterNavigator {
  navigate: (
    to: string,
    options?: { replace?: boolean; state?: unknown }
  ) => void;
}

const noop = () => {
  console.warn('Router navigator is not registered yet.');
};

export const router: RouterNavigator = {
  navigate: noop,
};

export const setRouterNavigator = (navigate: RouterNavigator['navigate']) => {
  router.navigate = navigate;
};
