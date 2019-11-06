import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import api from '../../services/api';

import { Loading, Owner, IssueList, Filter, NavButton, NavBox } from './styles';
import Container from '../../components/Container';

export default class Repository extends Component {
  state = {
    repository: {},
    issues: [],
    loading: true,
    checked: 'open',
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
          per_page: '5',
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  async IssuesHandler() {
    const { page, checked } = this.state;
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);

    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: checked,
        per_page: '5',
        page,
      },
    });

    return issues;
  }

  async handleFilter(filter) {
    this.setState({
      loading: true,
      checked: filter,
    });

    const issues = await this.IssuesHandler();

    this.setState({
      loading: false,
      issues: issues.data,
    });
  }

  async handleNavigation(operation) {
    const { page } = this.state;

    this.setState({
      loading: true,
      page: operation === 'sub' ? page - 1 : page + 1,
    });

    const issues = await this.IssuesHandler();

    this.setState({
      loading: false,
      issues: issues.data,
    });
  }

  render() {
    const { repository, issues, loading, checked, page } = this.state;

    if (loading) {
      return <Loading>Carregando...</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssueList>
          <Filter>
            <strong>Filtro:</strong>
            <input
              type="radio"
              name="filter"
              value="all"
              onChange={() => this.handleFilter('all')}
              checked={checked === 'all' ? 'checked' : ''}
            />
            All
            <input
              type="radio"
              name="filter"
              value="open"
              onChange={() => this.handleFilter('open')}
              checked={checked === 'open' ? 'checked' : ''}
            />
            Open
            <input
              type="radio"
              name="filter"
              value="closed"
              onChange={() => this.handleFilter('closed')}
              checked={checked === 'closed' ? 'checked' : ''}
            />
            Closed
          </Filter>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}> {issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={label.id}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
          <NavBox>
            <NavButton page={page} onClick={() => this.handleNavigation('sub')}>
              <FaArrowLeft color="#fff" size={12} />
              <strong>Anterior</strong>
            </NavButton>
            <NavButton onClick={() => this.handleNavigation('plus')}>
              <strong>Próximo</strong>
              <FaArrowRight color="#fff" size={12} />
            </NavButton>
          </NavBox>
        </IssueList>
      </Container>
    );
  }
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};
