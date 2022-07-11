const allUserRights = ['getUsers', 'manageUsers'];
const allTeamRights = ['getTeam', 'manageTeam', 'deleteTeam'];

const userRoleRights = {
  user: [],
  admin: ['getUsers', 'manageUsers'],
};

const teamRoleRights = {
	teamUser: ['getTeam'],
	teamAdmin: ['getTeam', 'manageTeam'],
	teamOwner: ['getTeam', 'manageTeam', 'deleteTeam'],
}

const userRoles = Object.keys(userRoleRights);
const teamRoles = Object.keys(teamRoleRights);

module.exports = {
	allUserRights,
	allTeamRights,
  userRoles,
  teamRoles,
  userRoleRights,
  teamRoleRights,
};