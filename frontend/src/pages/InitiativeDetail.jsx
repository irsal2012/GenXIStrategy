import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  CircularProgress,
} from '@mui/material'

function InitiativeDetail() {
  const { id } = useParams()

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Initiative Details
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Initiative ID: {id}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Detailed view coming soon...
        </Typography>
      </Paper>
    </Box>
  )
}

export default InitiativeDetail
