import Team from '../pages/team/Team';
import Profile from '../pages/team/TeamProfile';
const routes = [
  {
    path: '/team',
    element: <Team />,
  },
  {
    path: '/team/profile',
    element: <Profile />,
  },
];
export default routes;
