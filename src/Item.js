import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import React, { useEffect, useState } from 'react'
import * as converter from './converter'
import * as crossref from './crossref'
import * as exporter from './exporter'
import { extensions, FORMAT_RIS } from './formats'

export const Item = React.memo(({ format, text, index, addSelectedItem }) => {
  const [citation, setCitation] = useState(text)
  const [editedCitation, setEditedCitation] = useState(text)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState()
  const [matches, setMatches] = useState()
  const [selected, setSelected] = useState()
  const [selectedItem, setSelectedItem] = useState()

  useEffect(() => {
    setCitation(text)
    setEditedCitation(text)
    setSelected(undefined)
  }, [text, addSelectedItem, index])

  useEffect(() => {
    setError(undefined)
    setMatches(undefined)
    setSelected(undefined)
    setSelectedItem(undefined)
    setSearching(true)

    crossref
      .get({
        url: '/works',
        params: {
          'query.bibliographic': citation,
          rows: 3,
        },
      })
      .then(response => {
        if (response && response.status === 200) {
          setMatches(response.data.message.items)
        } else {
          setError('There was an error while searching for this item')
        }
      })
      .catch(error => {
        console.error(error)
        setError('There was an error while searching for this item')
      })
      .finally(() => {
        setSearching(false)
      })
  }, [citation])

  useEffect(() => {
    if (matches && matches.length) {
      setSelected(matches[0].DOI)
    } else {
      setSelected(undefined)
    }
  }, [matches])

  useEffect(() => {
    setSelectedItem(undefined)
    addSelectedItem(index, selected === null ? '' : undefined)

    if (selected) {
      const fetchDataFromCrossref = () => {
        crossref
          .get({
            url: `/works/${encodeURIComponent(
              selected
            )}/transform/${encodeURIComponent(format)}`,
            transformResponse: [data => data],
          })
          .then(response => {
            if (response && response.status === 200) {
              setSelectedItem(response.data)
              addSelectedItem(index, response.data)
            }
          })
      }

      const fetchDataFromPubMed = () => {
        converter
          .get({
            params: {
              ids: selected,
            },
          })
          .then(response => {
            if (!response || response.status !== 200) {
              throw new Error()
            }

            const { status, records } = response.data

            if (status !== 'ok' || !records || !records.length) {
              throw new Error()
            }

            const [record] = records

            if (!record.pmid) {
              throw new Error()
            }

            return record.pmid
          })
          .then(pmid =>
            exporter.get({
              url: 'pubmed/',
              params: {
                id: pmid,
                format: extensions[format],
              },
            })
          )
          .then(response => {
            if (!response || response.status !== 200) {
              throw new Error()
            }

            setSelectedItem(response.data)
            addSelectedItem(index, response.data)
          })
          .catch(() => {
            fetchDataFromCrossref()
          })
      }

      if (format === FORMAT_RIS) {
        fetchDataFromPubMed()
      } else {
        fetchDataFromCrossref()
      }
    }
  }, [addSelectedItem, index, format, selected])

  return (
    <Paper style={{ background: '#add8e6', padding: 16 }}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Typography variant={'h3'}>Citation {index + 1}</Typography>

          <TextField
            fullWidth
            multiline
            value={editedCitation}
            onChange={event => setEditedCitation(event.target.value)}
            style={{
              background: 'white',
              padding: 8,
              marginTop: 8,
              boxSizing: 'border-box',
            }}
          />

          {editedCitation !== citation && (
            <Button
              variant={'contained'}
              color={'primary'}
              onClick={() => setCitation(editedCitation)}
            >
              Search again
            </Button>
          )}
        </Grid>

        <Grid item xs={12}>
          {searching && <Typography variant={'body1'}>Searching…</Typography>}

          {error && <Typography variant={'body1'}>{error}</Typography>}

          {matches && (
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant={'h3'}>Matches</Typography>

                  <List dense>
                    {matches.map(match => {
                      const isSelected = selected && selected === match.DOI

                      return (
                        <ListItem
                          alignItems={'flex-start'}
                          button
                          key={match.DOI}
                          style={{
                            background: isSelected ? 'yellow' : 'white',
                            borderWidth: 1,
                            borderLeftWidth: 5,
                            borderStyle: 'solid',
                            borderColor: isSelected ? 'black' : 'transparent',
                            marginBottom: 8,
                          }}
                          onClick={() =>
                            setSelected(isSelected ? null : match.DOI)
                          }
                        >
                          <ListItemText
                            primary={match.title ? match.title[0] : ''}
                            secondary={<Metadata item={match} />}
                          />
                        </ListItem>
                      )
                    })}
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant={'h3'}>Citation data</Typography>

                  {selected ? (
                    <pre
                      style={{
                        background: 'white',
                        padding: 8,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      <code>{selectedItem}</code>
                    </pre>
                  ) : (
                    <div style={{ marginTop: 8, marginBottom: 8 }}>
                      <Typography variant={'body1'}>
                        No matches selected!
                      </Typography>

                      <Typography variant={'body1'}>
                        Either select the correct match, edit the text above and
                        search again, or leave unselected if none are correct.
                      </Typography>
                    </div>
                  )}
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Paper>
  )
})

const Metadata = React.memo(({ item }) => (
  <div>
    {item.author && <div>{crossref.authors(item.author)}</div>}
    <div>
      {item.issued && <span>{crossref.year(item.issued)}</span>}
      {' · '}
      {item['container-title'] && <span>{item['container-title'][0]}</span>}
    </div>
  </div>
))
